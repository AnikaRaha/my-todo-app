const JIRA_BASE_URL = process.env.JIRA_BASE_URL;
const JIRA_EMAIL = process.env.JIRA_USER_EMAIL;
const JIRA_TOKEN = process.env.JIRA_API_TOKEN;
const SLACK_WEBHOOK = process.env.SLACK_WEBHOOK_URL;

async function createJiraBug(testName, errorMessage) {
  const auth = Buffer.from(`${JIRA_EMAIL}:${JIRA_TOKEN}`).toString('base64');

  const response = await fetch(`${JIRA_BASE_URL}/rest/api/3/issue`, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fields: {
        project: { key: 'TODO' },
        summary: `[AUTO] Test failed: ${testName}`,
        description: {
          type: 'doc',
          version: 1,
          content: [{
            type: 'paragraph',
            content: [{
              type: 'text',
              text: `Automated test failure detected.\n\nTest: ${testName}\n\nError: ${errorMessage}`
            }]
          }]
        },
        issuetype: { name: 'Bug' },
        priority: { name: 'High' },
      }
    })
  });

  const data = await response.json();
  return data.key; // e.g. TODO-22
}

async function sendSlackNotification(testName, jiraKey) {
  await fetch(SLACK_WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🐛 *New Bug Reported!*`,
      blocks: [
        {
          type: 'section',
          text: {
            type: 'mrkdwn',
            text: `🐛 *New Bug Reported Automatically*\n*Test:* ${testName}\n*Jira Ticket:* <${JIRA_BASE_URL}/browse/${jiraKey}|${jiraKey}>\n*Status:* Open`
          }
        }
      ]
    })
  });
}

export { createJiraBug, sendSlackNotification };