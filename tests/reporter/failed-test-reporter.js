import { createJiraBug, sendSlackNotification } from './jira-slack-reporter.js';

class FailedTestReporter {
  onBegin(config, suite) {
    console.log(`Starting test run with ${suite.allTests().length} tests`);
  }

  async onTestEnd(test, result) {
    if (result.status === 'failed') {
      const testName = test.title;
      const errorMessage = result.error?.message || 'No error message';

      console.log(`❌ Test failed: ${testName}`);
      console.log(`Creating Jira bug and sending Slack notification...`);

      try {
        const jiraKey = await createJiraBug(testName, errorMessage);
        console.log(`✅ Jira bug created: ${jiraKey}`);
        await sendSlackNotification(testName, jiraKey);
        console.log(`✅ Slack notification sent`);
      } catch (err) {
        console.error(`Failed to report bug: ${err.message}`);
      }
    }
  }

  onEnd(result) {
    console.log(`Test run finished with status: ${result.status}`);
  }
}

export default FailedTestReporter;