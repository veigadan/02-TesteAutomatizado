import { test, expect } from '@playwright/test';

test.describe('QS Acadêmico — Testes do Sistema de Notas', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/02-TesteAutomatizado/');
  });

  // ========== GRUPO 1: Cadastro de Alunos ==========

  test.describe('Cadastro de Alunos', () => {

    test('deve cadastrar um aluno com dados válidos', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('João Silva');
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Verificar que o aluno aparece na tabela
      await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
      await expect(page.getByRole('cell', { name: 'João Silva', exact: true })).toBeVisible();
    });

    test('deve exibir mensagem de sucesso após cadastro', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Ana Costa');
      await page.getByLabel('Nota 1').fill('9');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      await expect(page.locator('#mensagem')).toContainText('cadastrado com sucesso');
    });

    test('não deve cadastrar aluno sem nome', async ({ page }) => {
      await page.getByLabel('Nota 1').fill('7');
      await page.getByLabel('Nota 2').fill('8');
      await page.getByLabel('Nota 3').fill('6');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // A tabela deve continuar sem dados reais
      await expect(page.locator('#tabela-alunos tbody td.texto-central')).toBeVisible();
    });

  });

  // ========== GRUPO 2: Cálculo de Média ==========

  test.describe('Cálculo de Média', () => {

    test('deve calcular a média aritmética das três notas', async ({ page }) => {
      await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
      await page.getByLabel('Nota 1').fill('8');
      await page.getByLabel('Nota 2').fill('6');
      await page.getByLabel('Nota 3').fill('10');

      await page.getByRole('button', { name: 'Cadastrar' }).click();

      // Média esperada: (8 + 6 + 10) / 3 = 8.00
      const celulaMedia = page.locator('#tabela-alunos tbody tr').first().locator('td').nth(4);
      await expect(celulaMedia).toHaveText('8.00');
    });

  });

    //   Teste de validação de notas: Verificar que o sistema rejeita notas fora do 
    //   intervalo 0–10 (por exemplo, nota = 11 ou nota = -1).
  test.describe(`Teste de validação de notas`, () => {
    test(`deve impedir de adicionar notas fora do intervalo 0-10`, async ({ page }) => {
        await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
        await page.getByLabel('Nota 1').fill('11');
        await page.getByLabel('Nota 2').fill('11');
        await page.getByLabel('Nota 3').fill('11');
  
        await page.getByRole('button', { name: 'Cadastrar' }).click();

        const aviso = page.locator('#mensagem').first();
        await expect(aviso).toBeVisible();
        await expect(aviso).toHaveText('As notas devem estar entre 0 e 10.');
    });
  });

    //   Teste de busca por nome: Cadastrar dois alunos e verificar que o 
    //   filtro de busca exibe apenas o aluno correspondente ao termo digitado.
    test.describe(`Teste de validação de cadastro`, () => {
        test(`filtro de busca exibe apenas o aluno correspondente ao termo digitado.`, async ({ page }) => {
            
            await page.getByLabel('Nome do Aluno').fill('Pedro Santos');
            await page.getByLabel('Nota 1').fill('10');
            await page.getByLabel('Nota 2').fill('10');
            await page.getByLabel('Nota 3').fill('10');
            await page.getByRole('button', { name: 'Cadastrar' }).click();


            await page.getByLabel('Nome do Aluno').fill('Daniel Veiga');
            await page.getByLabel('Nota 1').fill('10');
            await page.getByLabel('Nota 2').fill('10');
            await page.getByLabel('Nota 3').fill('10');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            await page.getByLabel('Buscar por nome').fill('Daniel Veiga');

            await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(1);
            await expect(page.getByRole('cell', { name: 'Daniel Veiga', exact: true })).toBeVisible();
        });
    });

    test.describe(`Teste de validação de exclusão`, () => {
        test(`aluno realmente é apagado ao apertar o botão de excluir`, async ({ page }) => {

            await page.getByRole('textbox', { name: 'Nome do Aluno' }).click();
            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Daniel Veiga');
            await page.getByRole('textbox', { name: 'Nome do Aluno' }).press('Tab');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).press('Tab');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).press('Tab');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('10');
            await page.getByRole('button', { name: 'Cadastrar' }).click();
            await page.getByRole('button', { name: 'Excluir Daniel Veiga' }).click();

            await expect(page.locator('#tabela-alunos tbody tr').first()).toHaveText('Nenhum aluno cadastrado.');
            await expect(page.getByText('Daniel Veiga')).not.toBeVisible();
        });
    });

    test.describe(`Validação de situação`, () => {
        test(`verificar que os totais nos cards de estatísticas estão corretos.`, async ({ page }) => {
            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 1');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('10');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 2');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('5');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('5');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('5');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 3');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('0');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('0');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('0');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            var item1 = page.locator('#stat-total');
            await expect(item1).toHaveText('3');

            var item2 = page.locator('#stat-aprovados');
            await expect(item2).toHaveText('1');

            var item3 = page.locator('#stat-recuperacao');
            await expect(item3).toHaveText('1');

            var item4 = page.locator('#stat-reprovados');
            await expect(item4).toHaveText('1');
        });
    });

    test.describe(`Validação de situação`, () => {
        test(`verificar se o aluno foi aprovado.`, async ({ page }) => {
            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 1');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('10');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            var linha1 = page.getByTestId('aluno-1').getByRole('cell', { name: 'Aprovado' });
            await expect(linha1).toBeVisible();
        });
    });

    test.describe(`Validação de situação`, () => {
        test(`verificar se o aluno foi reprovado.`, async ({ page }) => {
            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 1');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('1');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('1');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('1');
            await page.getByRole('button', { name: 'Cadastrar' }).click();
    
            var linha1 = page.getByTestId('aluno-1').getByRole('cell', { name: 'Reprovado' });
            await expect(linha1).toBeVisible();
        });
    });

    test.describe(`Validação de situação`, () => {
        test(`verificar se o aluno está em recuperação.`, async ({ page }) => {
            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 1');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('5');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('5');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('5');
            await page.getByRole('button', { name: 'Cadastrar' }).click();
    
            var linha1 = page.getByTestId('aluno-1').getByRole('cell', { name: 'Recuperação' });
            await expect(linha1).toBeVisible();
        });
    });

    test.describe(`Validação de situação`, () => {
        test(`verificar que os totais de registros está corretos.`, async ({ page }) => {
            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 1');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('10');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('10');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 2');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('5');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('5');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('5');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            await page.getByRole('textbox', { name: 'Nome do Aluno' }).fill('Aluno 3');
            await page.getByRole('spinbutton', { name: 'Nota 1' }).fill('0');
            await page.getByRole('spinbutton', { name: 'Nota 2' }).fill('0');
            await page.getByRole('spinbutton', { name: 'Nota 3' }).fill('0');
            await page.getByRole('button', { name: 'Cadastrar' }).click();

            await expect(page.locator('#tabela-alunos tbody tr')).toHaveCount(3);

        });
    });
});
