module.exports = async (gh) => {

  let violations = gh.core.getInput("violations", {});

  if (!violations || violations.length == 0) {
    console.log("No action policy violations detected.")
    return;
  }

  let workflows = JSON.parse(violations);
  let bodyMessage = "## :warning: Action Policy Violation\n\n" +
    `Commit: ${gh.context.sha}\n\n` +
    "The following workflow files contain actions that violate the action policy put in place by the administrator of this repository:\n";

  workflows.forEach((item) => {
    bodyMessage += `\n\n:x: ${item.filePath}`;
    item.actions.forEach((action) => {
      bodyMessage += `\n- [ ] ${action.author}/${action.name}@${action.ref}`;
    });

    bodyMessage += "\n";
  });

  bodyMessage += "\n\nPlease choose alternate actions that conform to the action policy and re-attempt."

  if (gh.context.eventName == "push") {
    let issue = await gh.github.issues.create({
      owner: gh.context.repo.owner,
      repo: gh.context.repo.repo,
      title: "Action Policy Violation Detected!!",
      assignee: gh.context.payload.pusher.name,
      body: bodyMessage,
      labels: ["Action Policy Violation"],
    });

    console.log(`Issue created - ${issue.data.number} - ${issue.data.html_url}`);
  } else {

    await gh.github.issues.addLabels({
      labels: ["Action Policy Violation"],
      owner: gh.context.repo.owner,
      repo: gh.context.repo.repo,
      issue_number: gh.context.payload.pull_request.number
    })

    let issue = await gh.github.issues.createComment({
      owner: gh.context.repo.owner,
      repo: gh.context.repo.repo,
      issue_number: gh.context.payload.pull_request.number,
      body: bodyMessage
    })

    console.log(`Pull request labeled and commented - ${issue.data.html_url}`);
  }

  gh.core.setFailed("!!! ACTION POLICY VIOLATIONS DETECTED !!!");
}