import { Connection, QueryResult } from 'jsforce';
import type { Message, Application, Interview } from '@db/schema';

const conn = new Connection({
  loginUrl: process.env.SALESFORCE_LOGIN_URL
});

export async function initSalesforce() {
  await conn.login(
    process.env.SALESFORCE_USERNAME!,
    process.env.SALESFORCE_PASSWORD!
  );
}

export async function createContact(user: any) {
  const contact = {
    FirstName: user.username,
    Email: user.email,
    GDPR_Consent__c: user.gdprConsent
  };

  return await conn.sobject('Contact').create(contact);
}

export async function logMessage(message: Message) {
  const task = {
    Subject: 'Admission Chat Message',
    Description: message.content,
    Channel__c: message.channel,
    Direction__c: message.direction
  };

  return await conn.sobject('Task').create(task);
}

export async function updateApplication(application: Application) {
  const opportunity = {
    StageName: application.status,
    University__c: application.universityId,
    Candidate__c: application.userId
  };

  return await conn.sobject('Opportunity').create(opportunity);
}

export async function logInterview(interview: Interview) {
  const event = {
    Subject: 'Admission Interview',
    Recording_URL__c: interview.recording,
    Feedback__c: JSON.stringify(interview.feedback)
  };

  return await conn.sobject('Event').create(event);
}
