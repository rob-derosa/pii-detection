import fetch from 'node-fetch'

export interface RequestDocumentRoot {
  documents: RequestDocument[];
}

export interface RequestDocument {
  id: string;
  language: string;
  text: string;
}

export interface ResponseDocumentRoot {
  documents: ResponseDocument[];
  errors: any[];
  modelVersion: Date;
}

export interface ResponseDocument {
  id: string;
  entities: Entity[];
  warnings: any[];
}

export interface Entity {
  text: string;
  category: string;
  offset: number;
  length: number;
  confidenceScore: number;
}

export async function callPiiDetectionEndpoint(textToCheck: string, azureCognitiveEndpoint: string, azureCognitiveSubscriptionKey: string): Promise<ResponseDocumentRoot> {
  try {

    let url = `${azureCognitiveEndpoint}/text/analytics/v3.1-preview.1/entities/recognition/pii?model-version=2020-04-01`

    let requestRoot = {
      documents: Array<RequestDocument>()
    }

    requestRoot.documents.push({
      id: "1",
      language: "en", //make this an input at some point
      text: textToCheck
    });

    return fetch(url, {
      method: "POST",
      body: JSON.stringify(requestRoot),
      headers: {
        "Ocp-Apim-Subscription-Key": azureCognitiveSubscriptionKey,
        "Content-Type": "application/json"
      }
    })
      .then(res => res.json())
      .then(res => {
        return res as ResponseDocumentRoot
      });
  } catch (error) {
    console.log(error);
    throw error
  }
}