import * as pii from "./pii-detector";
import * as core from "@actions/core";
import * as github from '@actions/github'

async function run(): Promise<void> {
  try {
    
    const subKey = core.getInput("azure-cognitive-subscription-key", { required: true })
    const url = core.getInput("azure-cognitive-endpoint", { required: true })
    const categories = core.getInput("categories", { required: true }).toLowerCase().split("|")
    const labelText = core.getInput("label-text", { required: false })
    const gitHubToken = core.getInput("github-token", { required: true })
    const context = github.context;

    console.log(context.payload);

    if (!categories || categories.length == 0)
      throw new Error('No categories defined');

    if (!subKey)
      throw new Error('No Azure Cognitive Service subscription key defined');

    if (!url)
      throw new Error('No Azure Cognitive Service endpoint defined');

    const client = github.getOctokit(gitHubToken);
    let textToCheck;
    let containsPii = false;
    let issueNumber = 0;

    if (context.payload.issue && (context.payload.action === 'opened' || context.payload.action === 'edited')) {
      //An issue was opened or updated
      textToCheck = context.payload.issue.body;
      issueNumber = context.issue.number;
    }

    if (context.payload.pull_request && (context.payload.action === 'opened' || context.payload.action === 'edited')) {
      //A pull request was opened or updated
      textToCheck = context.payload.pull_request.body;
      issueNumber = context.payload.pull_request.number;
    }

    if (context.payload.comment && (context.payload.action === 'created' || context.payload.action === 'edited')) {
      //A comment was added to the issue/pull request
      textToCheck = context.payload.comment.body;
      issueNumber = context.issue.number;
    }

    const response = await pii.callPiiDetectionEndpoint(textToCheck, url, subKey)

    if (response) {
      console.log("\n\n------------------------------------------------------");
      response.documents.forEach(doc => {
        doc.entities.forEach(ent => {

          let log = `${ent.category} detected with ${ent.confidenceScore * 100}% confidence score and a value of: '${ent.text}'`

          //We only care about results with a confidence score of 60% or higher
          if (ent.confidenceScore >= .6 && categories.includes(ent.category.toLowerCase())) {
            containsPii = true;
          } else {
            log = `${log} - SKIPPING`
          }
          console.log(log)
        });
      });
      core.setOutput("results", JSON.stringify(response));

      if (containsPii && labelText) {
        let labels = [labelText];

        client.issues.addLabels({
          labels: labels,
          owner: context.repo.owner,
          repo: context.repo.repo,
          issue_number: issueNumber
        })
      } else {
        console.log(`No PII detected 60% or greated in the text >\n${textToCheck}`)
      }
      console.log("------------------------------------------------------\n\n");
    }
  } catch (error) {
    console.log(error);
    core.setFailed(error.message)
  }
}

run()