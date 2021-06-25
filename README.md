# PII Detection Action 

This is a GitHub action to detect PII (Personally Identifiable Information) such as phone numbers, social security numbers, email addresses, IP addresses, etc. in any issues or pull requests that are opened, edited or commented on. If PII is detected using the [Entity Recognition Cognitive Service](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/named-entity-types?tabs=personal) from Microsoft under the `personal` domain, a custom label is added to the issue or pull request.

Only positive detections with a confidence score are considered valid. All detections are logged to the console for review.

A `results` output value is available containing the JSON response payload providing a detailed analysis of the results.

## Usage

Create a `.github/workflows/detect-pii.yml` file:

```yaml
name: 'Detect PII'
on:
  issues:
    types:
      - opened
      - edited
  issue_comment:
    types:
      - created
      - edited
  pull_request:
    types:
      - opened
      - edited
  pull_request_review_comment:
    types:
      - created
      - edited
jobs:
  detect-pii:
    runs-on: ubuntu-latest
    steps:
      - uses: rob-derosa/pii-detector@v1
        name: "Run PII detector"
        with:
          azure-cognitive-subscription-key: ${{ secrets.AZURE_COGNITIVE_SUBSCRIPTION_KEY }}
          azure-cognitive-endpoint: ${{ secrets.AZURE_COGNITIVE_ENDPOINT }}
          categories: "email|ip|phone number"
          label-text: "PII Detected!!"
          github-token: ${{ secrets.GITHUB_TOKEN }}
```

## Configuration

The following inputs are required:

- `azure-cognitive-subscription-key`: A valid [Azure Cognitive Service](https://ms.portal.azure.com/#create/Microsoft.CognitiveServicesAllInOne) key
- `azure-cognitive-endpoint`: in the [Azure portal](https://portal.azure.com), navigate to your Cognitive Service resource > Keys and Endpoint > Endpoint (i.e. `https://centralus.api.cognitive.microsoft.com/`)
- `categories`: category names (case insensitive) joined by pipe `|` outlined in [this document](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/named-entity-types?tabs=personal)
- `label-text`: the text of the label to be applied to any issues or pull requests in which PII is detected - leave blank to bypass adding a label
- `github-token`: leave this be :metal:

## In Action

**A bug filed by a user was commented on by a contributor, triggering an PII analysis of the body of the comment**
![PII Detection Step Output](assets/pii_detection_action_output.png?raw=true)

**PII was detected, some of which was discarded due to category configuration**
![Issue containing PII flagged with label](assets/pii_detection_issue_labeled.png?raw=true)


## Limitations

* There is a 5,120 character limit and 1MB total request payload size as outlined [here](https://docs.microsoft.com/en-us/azure/cognitive-services/text-analytics/concepts/data-limits?tabs=version-3).
* This sample could be extended to batch the request up to 5 per payload.

## Improvements

* input parameters to configure:
  * source language (defaults to English)
  * additional trigger points
  * custom labels based on PII type
  * subcategory support
* tests
* support for larger text payloads

## License

MIT


