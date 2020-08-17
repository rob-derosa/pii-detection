module.exports = async (gh) => {

  let violations = gh.core.getInput("violations", {});

  if (!violations || violations.length == 0) {
    console.log("No violations detected.")
    return;
  }

  let packages = JSON.parse(violations);
  let bodyMessage = "## :package: Package Policy Violation\n\n" +
    `Commit: ${gh.context.sha}\n\n` +
    "The following referenced package(s) violate the package policy put in place by the administrator of this repository:\n";

  packages.forEach((item) => {
    bodyMessage += `\n- [ ] :x: ${item.name} - ${item.version}`;
  });
  bodyMessage += "\n\nPlease choose alternate packages that conform to the package policy and re-attempt."

  if (gh.context.eventName == "push") {
    let issue = await gh.github.issues.create({
      owner: gh.context.repo.owner,
      repo: gh.context.repo.repo,
      title: "Package Violation Detected!!",
      assignee: gh.context.payload.pusher.name,
      body: bodyMessage,
      labels: ["Package Violation"],
    });

    console.log(`Issue created - ${issue.data.number} - ${issue.data.html_url}`);
  } else {

    await gh.github.issues.addLabels({
      labels: ["Package Violation"],
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

    console.log(`Pull request labeled and commented - ${issue.data.number} - ${issue.data.html_url}`);
  }

  gh.core.setFailed("!!! PACKAGE POLICY VIOLATIONS DETECTED !!!");
}
