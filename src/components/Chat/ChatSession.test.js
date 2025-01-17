// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import ChatSession from "./ChatSession";
import { AttachmentErrorType, ContentType } from "./datamodel/Model";

const ParticipantId = "123";
const chatDetails = {
  startChatResult: {
    ContactId: "aaa",
    ParticipantId: ParticipantId,
    ParticipantToken: "bbb",
  },
};
const region = "us-west-2";
const stage = "dev";
const AbsoluteTime = new Date(Date.now()).getTime() / 1000;
const transcriptResponse = {
  data: {
    Transcript: [
      {
        Id: "italics",
        Type: "message",
        ParticipantId: "456",
        AbsoluteTime: AbsoluteTime,
        transportDetails: {
          direction: "Outgoing",
          status: "SendSuccess",
        },
        ParticipantRole: "CUSTOMER",
        content: {
          type: ContentType.MESSAGE_CONTENT_TYPE.TEXT_MARKDOWN,
          data: "*italics*",
        },
      },
      {
        Id: "bold",
        Type: "message",
        ParticipantId: "123",
        AbsoluteTime: AbsoluteTime + 1000,
        ParticipantRole: "AGENT",
        transportDetails: {
          direction: "Incoming",
          messageReceiptType: "delivered",
          status: "SendSuccess",
        },
        MessageMetadata: {
          MessageId: "bold",
          Receipts: [
            {
              RecipientParticipantId: "RecipientParticipantId",
              DeliveredTimestamp: new Date().toISOString(),
              ReadTimestamp: new Date().toISOString(),
            },
          ],
        },
        lastDeliveredReceipt: true,
        content: {
          type: ContentType.MESSAGE_CONTENT_TYPE.TEXT_MARKDOWN,
          data: "**bold**",
        },
      },
      {
        Id: "numberedList",
        Type: "message",
        ParticipantId: "456",
        AbsoluteTime: AbsoluteTime + 2000,
        ParticipantRole: "AGENT",
        transportDetails: {
          direction: "Incoming",
          status: "SendSuccess",
        },
        content: {
          type: ContentType.MESSAGE_CONTENT_TYPE.TEXT_MARKDOWN,
          data: "1. item1 \n 1. item2",
        },
      },
      {
        Id: "bulletedList",
        Type: "message",
        ParticipantId: "123",
        AbsoluteTime: AbsoluteTime + 3000,
        ParticipantRole: "CUSTOMER",
        transportDetails: {
          direction: "Outgoing",
          status: "SendSuccess",
        },
        content: {
          type: ContentType.MESSAGE_CONTENT_TYPE.TEXT_MARKDOWN,
          data: "* item3 \n * item4",
        },
      },
      {
        AbsoluteTime: AbsoluteTime + 4000,
        MessageMetadata: {
          MessageId: "31bf18c9-d80b-4f75-8145-c47946a26e03",
          Receipts: [],
        },
        Content:
          "Amazon Connect will now simulate rolling dice by using the Distribute randomly block,,,now rolling,,,,,,,",
        ContentType: "text/plain",
        DisplayName: "SYSTEM_MESSAGE",
        Id: "31bf18c9-d80b-4f75-8145-c47946a26e03",
        ParticipantId: "bcd32342-dd03-42ce-9288-9c44ebf81c4e",
        ParticipantRole: "SYSTEM",
        Type: "MESSAGE",
      },
      {
        Id: "bulletedList2",
        Type: "message",
        ParticipantId: "123",
        AbsoluteTime: AbsoluteTime + 5000,
        ParticipantRole: "CUSTOMER",
        transportDetails: {
          direction: "Outgoing",
          status: "SendSuccess",
        },
        content: {
          type: ContentType.MESSAGE_CONTENT_TYPE.TEXT_MARKDOWN,
          data: "* item3 \n * item4",
        },
      },
    ],
  },
};

beforeAll(() => {
  window.connect = {
    ChatSession: {
      create: function (obj) {
        return {
          controller: { contactId: "aaa" },
          getChatDetails: jest.fn(() => {
            return { participantId: ParticipantId };
          }),
          sendMessage: jest.fn().mockResolvedValue("aaa"),
          sendEvent: jest.fn().mockResolvedValue("bb"),
          sendReadReceipt: jest.fn().mockResolvedValue("bb"),
          sendDeliveredReceipt: jest.fn().mockResolvedValue("bb"),
          sendAttachment: jest.fn().mockImplementation(
            (...input) =>
              new Promise((resolve, reject) => {
                if (input[0].attachment.status === "resolve") {
                  resolve(input[0].attachment);
                } else {
                  reject(input[0].attachment);
                }
              })
          ),
        };
      },
    },
  };
});
afterAll(() => {
  delete window.connect;
});

describe("ChatSession", () => {
  describe("About logger", () => {
    describe("LogManager is defined", () => {
      let session;
      beforeEach(() => {
        window.connect.LogManager = {
          getLogger: function (obj) {
            return {
              debug: jest.fn(),
              info: jest.fn(),
              error: jest.fn(),
            };
          },
        };
        session = new ChatSession(chatDetails, region, stage);
      });
      test("logger should be defined when LogManager is available", () => {
        expect(session.logger).toBeDefined();
      });

      test("logger should be called when addOutgoingMessage is triggered", () => {
        session.addOutgoingMessage({});
        expect(session.logger.info).toBeCalled();
      });
      test("logger should be called when sendTypingEvent is triggered", () => {
        session.sendTypingEvent();
        expect(session.logger.info).toBeCalled();
      });
      test("logger should be called when addOutgoingAttachment is triggered", () => {
        session.addOutgoingAttachment({});
        expect(session.logger.info).toBeCalled();
      });
      test("logger should be called when 'on' is triggered", () => {
        session.on(
          "incoming-message",
          jest.fn(() => {})
        );
        expect(session.logger.info).toBeCalled();
      });
      test("logger should be called when 'off' is triggered", () => {
        session.off(
          "incoming-message",
          jest.fn(() => {})
        );
        expect(session.logger.info).toBeCalled();
      });
      test("logger should be called when closeChat is triggered", () => {
        session.closeChat();
        expect(session.logger.info).toBeCalled();
      });
      test("sendAttachment: should display correct message if ServiceQuotaExceeded", () => {
        const DEFAULT_MESSAGE = "DEFAULT_MESSAGE";
        Object.values(AttachmentErrorType).forEach((exceptionType) => {
          let transcriptItem = {
            content: {
              status: "error",
              type: exceptionType,
              message: DEFAULT_MESSAGE,
            },
            transportDetails: {},
            id: "",
          };
          const returnVal = session.sendAttachment(transcriptItem);
          returnVal
            .then(() => {
              if (
                transcriptItem.transportDetails.error.type ===
                AttachmentErrorType.ServiceQuotaExceededException
              ) {
                expect(transcriptItem.transportDetails.error.message).toEqual(
                  "Attachment failed to send. The maximum number of attachments allowed, has been reached"
                );
              } else if (
                transcriptItem.transportDetails.error.type ===
                AttachmentErrorType.ValidationException
              ) {
                expect(transcriptItem.transportDetails.error.message).toEqual(
                  DEFAULT_MESSAGE
                );
              } else {
                expect(transcriptItem.transportDetails.error.message).toEqual(
                  "Attachment failed to send"
                );
              }
            })
            .catch((e) => {
              console.log("REJECTED", e);
            });
        });
      });
    });

    describe("LogManager is undefined", () => {
      test("logger should be undefined when LogManager is not available", () => {
        delete window.connect.LogManager;
        const session = new ChatSession(chatDetails, region, stage);
        expect(session.logger).toBeUndefined();
      });
    });
  });

  describe("ChatSession callbacks", () => {
    beforeAll(() => {
      window.connect = {
        LogManager: {
          getLogger: function (obj) {
            return console;
          },
        },
        ChatSession: {
          create: function (obj) {
            return {
              controller: { contactId: "aaa" },
              getChatDetails: jest.fn(() => {
                return { participantId: ParticipantId };
              }),
              onMessage: jest.fn().mockResolvedValue("aaa"),
              onTyping: jest.fn().mockResolvedValue("aaa"),
              onReadReceipt: jest.fn().mockResolvedValue("aaa"),
              onDeliveredReceipt: jest.fn().mockResolvedValue("aaa"),
              onEnded: jest.fn().mockResolvedValue("aaa"),
              onConnectionEstablished: jest.fn().mockResolvedValue("aaa"),
              connect: jest.fn().mockResolvedValue("aaa"),
              sendMessage: jest.fn().mockResolvedValue("aaa"),
              sendEvent: jest.fn().mockResolvedValue("bb"),
              sendReadReceipt: jest.fn().mockResolvedValue("bb"),
              sendDeliveredReceipt: jest.fn().mockResolvedValue("bb"),
              sendAttachment: jest.fn().mockImplementation(
                (...input) =>
                  new Promise((resolve, reject) => {
                    if (input[0].attachment.status === "resolve") {
                      resolve(input[0].attachment);
                    } else {
                      reject(input[0].attachment);
                    }
                  })
              ),
              getTranscript: () => Promise.resolve(transcriptResponse),
            };
          },
        },
        csmService: {
          addCountMetric: jest.fn().mockImplementation(() => {}),
          addLatencyMetric: jest.fn().mockImplementation(() => {}),
        },
      };
    });
    afterAll(() => {
      delete window.connect;
    });
    test("should register Read and Delivered events", () => {
      const session = new ChatSession(chatDetails, region, stage);
      session.openChatSession(true);
      expect(session.client.session.onReadReceipt).toBeCalled();
      expect(session.client.session.onDeliveredReceipt).toBeCalled();
    });
    test("should not update transcript if messageId not found", async () => {
      const session = new ChatSession(chatDetails, region, stage);
      session.openChatSession(true);
      const readCallback =
        session.client.session.onReadReceipt.mock.calls[0][0];
      const connectionEstablishedCallback =
        session.client.session.onConnectionEstablished.mock.calls[0][0];
      await connectionEstablishedCallback();
      const readReceiptMessage = {
        data: {
          Type: "MESSAGEMETADATA",
          MessageMetadata: {
            MessageId: "unknown_messageId",
            Receipts: [
              {
                DeliveredTimestamp: new Date().toISOString(),
                ReadTimestamp: new Date().toISOString(),
                RecipientParticipantId: "participantDEF",
              },
            ],
          },
          InitialContactId: "eb628fa4-9667-464f-905b-36de2f86f202",
          ContactId: "eb628fa4-9667-464f-905b-36de2f86f202",
        },
      };
      expect(session.transcript[0].lastReadReceipt).toEqual(false);
      readCallback(readReceiptMessage);
      expect(session.transcript[0].lastReadReceipt).toEqual(false);
    });
    test("should call handleMessageReceipt to update the transcript", async () => {
      const session = new ChatSession(chatDetails, region, stage);
      session.openChatSession(true);
      const readCallback =
        session.client.session.onReadReceipt.mock.calls[0][0];
      const deliveredCallback =
        session.client.session.onDeliveredReceipt.mock.calls[0][0];
      const connectionEstablishedCallback =
        session.client.session.onConnectionEstablished.mock.calls[0][0];
      await connectionEstablishedCallback();
      const readReceiptMessage = {
        data: {
          Type: "MESSAGEMETADATA",
          MessageMetadata: {
            MessageId: "italics",
            Receipts: [
              {
                DeliveredTimestamp: new Date().toISOString(),
                ReadTimestamp: new Date().toISOString(),
                RecipientParticipantId: "123",
              },
            ],
          },
          InitialContactId: "eb628fa4-9667-464f-905b-36de2f86f202",
          ContactId: "eb628fa4-9667-464f-905b-36de2f86f202",
        },
        chatDetails: {
          participantId: "participantId",
        },
      };
      expect(session.transcript[0].lastReadReceipt).toEqual(false);
      readCallback(readReceiptMessage);
      expect(session.transcript[0].lastReadReceipt).toEqual(true);

      const deliverReceiptMessage = {
        data: {
          Type: "MESSAGEMETADATA",
          MessageMetadata: {
            MessageId: "bulletedList",
            Receipts: [
              {
                DeliveredTimestamp: new Date().toISOString(),
                RecipientParticipantId: "123",
              },
            ],
          },
          InitialContactId: "eb628fa4-9667-464f-905b-36de2f86f202",
          ContactId: "eb628fa4-9667-464f-905b-36de2f86f202",
        },
        chatDetails: {
          participantId: "participantId",
        },
      };
      expect(session.transcript[3].lastDeliveredReceipt).toEqual(false);
      deliveredCallback(deliverReceiptMessage);
      expect(session.transcript[3].lastDeliveredReceipt).toEqual(true);
    });

    test("should call sendEvent with correct params when sendReadReceipt is called", () => {
      const session = new ChatSession(chatDetails, region, stage);
      session.openChatSession(true);
      session.client.session.sendEvent.mockClear();
      session.sendReadReceipt();
      expect(session.client.session.sendEvent).toBeCalled();
      expect(session.client.session.sendEvent.mock.calls[0][0]).toEqual({
        content: "{}",
        contentType: "application/vnd.amazonaws.connect.event.message.read",
      });
    });
    test("should call sendEvent with correct params when sendDeliveredReceipt is called", () => {
      const session = new ChatSession(chatDetails, region, stage);
      session.openChatSession(true);
      session.client.session.sendEvent.mockClear();
      session.sendDeliveredReceipt();
      expect(session.client.session.sendEvent).toBeCalled();
      expect(session.client.session.sendEvent.mock.calls[0][0]).toEqual({
        content: "{}",
        contentType:
          "application/vnd.amazonaws.connect.event.message.delivered",
      });
    });
    test("should call sendDeliveredReceipt when an new incoming message is received", () => {
      const session = new ChatSession(chatDetails, "", region, stage, true);
      session.client.onMessage = jest.fn();
      session.client.session.onMessage.mockClear();
      session.client.session.sendEvent.mockClear();
      session.openChatSession(true);
      const callbackFn = session.client.onMessage.mock.calls[0][0];
      const dataInput = JSON.parse(
        '{"data":{"AbsoluteTime":"2022-08-30T03:25:11.004Z","Content":"hi","ContentType":"text/plain","Id":"ID","Type":"MESSAGE","ParticipantId":"ParticipantId","DisplayName":"Agent","ParticipantRole":"AGENT","InitialContactId":"contactId","ContactId":"contactId"},"chatDetails":{"initialContactId":"initialContactId","contactId":"contactId","participantId":"participantId","participantToken":"Token="}}'
      );
      callbackFn(dataInput);
      expect(session.client.session.sendEvent).toBeCalled();
      expect(session.client.session.sendEvent.mock.calls[0][0]).toEqual({
        content: '{"messageId":"ID"}',
        contentType:
          "application/vnd.amazonaws.connect.event.message.delivered",
      });
    });

    test("should not call sendDeliveredReceipt when an participantRole is not Customer or Agent", () => {
      const session = new ChatSession(chatDetails, "", region, stage, true);
      session.client.onMessage = jest.fn();
      session.client.session.onMessage.mockClear();
      session.client.session.sendEvent.mockClear();
      session.openChatSession(true);
      const callbackFn = session.client.onMessage.mock.calls[0][0];
      const dataInput = JSON.parse(
        '{"data":{"AbsoluteTime":"2022-08-30T03:25:11.004Z","Content":"hi","ContentType":"text/plain","Id":"ID","Type":"MESSAGE","ParticipantId":"ParticipantId","DisplayName":"Agent","ParticipantRole":"SYSTEM","InitialContactId":"contactId","ContactId":"contactId"},"chatDetails":{"initialContactId":"initialContactId","contactId":"contactId","participantId":"participantId","participantToken":"Token="}}'
      );
      callbackFn(dataInput);
      expect(session.client.session.sendEvent).not.toBeCalled();
    });

    test('Interactive message test. The message of clicking "Show more" button should not be added to transcript, and transcript should only contain the latest interactive message with the same referenceId', () => {
      const session = new ChatSession(chatDetails, "", region, stage);
      session.client.onMessage = jest.fn();
      session.openChatSession(true);
      const callbackFn = session.client.onMessage.mock.calls[0][0];
      const baseMessageObj = {
        data: {
          AbsoluteTime: "2023-03-17T08:25:45.992Z",
          Type: "MESSAGE",
          ParticipantId: "ParticipantId",
          DisplayName: "BOT",
          ParticipantRole: "SYSTEM",
          InitialContactId: "InitialContactId",
          ContactId: "InitialContactId",
          ContentType: "application/vnd.amazonaws.connect.message.interactive",
        },
        chatDetails: {
          initialContactId: "InitialContactId",
          contactId: "InitialContactId",
          participantId: "ParticipantId",
          participantToken: "participantToken",
        },
      };

      // This object is sent and then receive from web socket when user click "Show more" button
      // This message is not added to transcript
      const interactiveMessageRes1 = {
        ...baseMessageObj,
        data: {
          ...baseMessageObj.data,
          Content:
            '{"version":"1.0","data":{"actionName":"Show more","preIndex":-1,"nextIndex":5,"listId":"serviceList","templateType":"ListPicker","referenceId":"0c210016-60d9-47f8-9342-551158f09110"},"action":"Show more"}',
          Id: "id1",
        },
      };

      // interactiveMessageRes2 and interactiveMessageRes3 contain the same referenceId, means they are from the same interactive message session
      // interactiveMessageRes3 is added after interactiveMessageRes2, so transcript should only contain interactiveMessageRes3, interactiveMessageRes2 should be removed.
      const interactiveMessageRes2 = {
        ...baseMessageObj,
        data: {
          ...baseMessageObj.data,
          Content:
            '{"templateType":"ListPicker","version":"1.0","data":{"content":{"listId":"serviceList","title":"What produce would you like to buy?","subtitle":"Tap to select option","referenceId":"referenceId","elements":[{"title":"Acupuncture","subtitle":"$1.00"},{"title":"Chiropractor","subtitle":"$1.00"},{"title":"Naturopath","subtitle":"$1.00"},{"title":"Show more"}],"preIndex":-1,"nextIndex":5}}}',
          Id: "id2",
        },
      };
      const interactiveMessageRes3 = {
        ...baseMessageObj,
        data: {
          ...baseMessageObj.data,
          Content:
            '{"templateType":"ListPicker","version":"1.0","data":{"content":{"listId":"serviceList","title":"What produce would you like to buy?","subtitle":"Tap to select option","referenceId":"referenceId","elements":[{"title":"Acupuncture","subtitle":"$1.00"},{"title":"Chiropractor","subtitle":"$1.00"},{"title":"Show more"}],"preIndex":-1,"nextIndex":5}}}',
          Id: "id3",
        },
      };

      // interactiveMessageRes4 is added after interactiveMessageRes3
      // their referenceIds are different, that means they are from different interactive message session
      // so interactiveMessageRes4 should be added to transcript.
      const interactiveMessageRes4 = {
        ...baseMessageObj,
        data: {
          ...baseMessageObj.data,
          Content:
            '{"templateType":"ListPicker","version":"1.0","data":{"content":{"listId":"serviceList","title":"What produce would you like to buy?","subtitle":"Tap to select option","referenceId":"newReferenceId","elements":[{"title":"Chiropractor","subtitle":"$1.00"},{"title":"Show more"}],"preIndex":-1,"nextIndex":5}}}',
          Id: "id4",
        },
      };
      callbackFn(interactiveMessageRes1);
      callbackFn(interactiveMessageRes2);
      callbackFn(interactiveMessageRes3);
      callbackFn(interactiveMessageRes4);
      // interactiveMessageRes1: The message of clicking "Show more" button is not added to transcript
      // interactiveMessageRes2 and interactiveMessageRes3 are from the same interavtive message session, so only the latest one(interactiveMessageRes3) is added to transcript
      // interactiveMessageRes4 is from a new session, so it can be added to transcript
      // so there are totally 2 messages in transcript
      expect(session.transcript.length).toEqual(2);
    });
  });
});
