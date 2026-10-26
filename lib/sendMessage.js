const { WAProto, generateWAMessageFromContent, prepareWAMessageMedia } = require("@whiskeysockets/baileys");
const { genThumbnail, extractVideoThumb } = require("./constant");
global.messages = {};
exports.prepareMessage = async (jid, message, options, type, upload) => {
  let preparedMessage, messageContent;
  switch (type) {
    case "button": {
      let buttonMessage = WAProto.ButtonsMessage.fromObject(message.button);
      messageContent = WAProto.Message.fromObject({ buttonsMessage: buttonMessage });
      break;
    }
    case "template": {
      let templateMessage = WAProto.TemplateMessage.fromObject(message.template);
      messageContent = WAProto.Message.fromObject({ templateMessage });
      break;
    }
    case "text": {
      let extendedText = message;
      messageContent = WAProto.Message.fromObject({ extendedTextMessage: extendedText });
      break;
    }
    case "list": {
      let listMessage = WAProto.ListMessage.fromObject(message.list);
      messageContent = WAProto.Message.fromObject({ listMessage });
      break;
    }
    default: {
      if ("image" in message) {
        message.jpegThumbnail = await genThumbnail(message.image);
      } else if ("video" in message) {
        const { thumbnail, duration } = await extractVideoThumb(message.video);
        message.jpegThumbnail = thumbnail;
        message.seconds = duration;
      }
      options.upload = upload.waUploadToServer;
      messageContent = await prepareWAMessageMedia(message, options);
      break;
    }
  }
  const [messageType] = Object.keys(messageContent);
  if (!messageContent[messageType].contextInfo) {
    messageContent[messageType].contextInfo = options.contextInfo || {};
  }
  preparedMessage = generateWAMessageFromContent(jid, messageContent, options);
  global.messages[preparedMessage.key.id] = preparedMessage;
  await upload.relayMessage(jid, preparedMessage.message, {
    messageId: preparedMessage.key.id,
    additionalAttributes: {}
  }).catch((error) => {
    console.log(error);
  });
};
