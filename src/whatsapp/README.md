# WhatsApp Module

This module integrates WhatsApp Web into the NestJS application using the `whatsapp-web.js` library.

## Features

- Automatic WhatsApp client initialization on application startup
- QR code generation for authentication
- Send messages to WhatsApp numbers
- Get chat list
- Status monitoring

## Setup

The module is already integrated into the application. When you start the application, the WhatsApp client will automatically initialize.

### First Time Authentication

1. Start the application: `npm run start:dev`
2. Look for the QR code in the terminal console
3. Scan the QR code with WhatsApp on your phone (WhatsApp > Settings > Linked Devices > Link a Device)
4. Once authenticated, the client will be ready to use

## API Endpoints

### 1. Check Status
**GET** `/whatsapp/status`

Returns the current status of the WhatsApp client.

**Response:**
```json
{
  "isReady": true
}
```

### 2. Send Message
**POST** `/whatsapp/send-message`

Send a message to a WhatsApp number.

**Request Body:**
```json
{
  "phoneNumber": "573001234567",
  "message": "Hello from the bot!"
}
```

**Note:** Phone number should include country code (e.g., 57 for Colombia) without the + sign.

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### 3. Get Chats
**GET** `/whatsapp/chats`

Returns a list of all WhatsApp chats.

**Response:**
```json
[
  {
    "id": {...},
    "name": "Contact Name",
    "isGroup": false,
    ...
  }
]
```

## Usage in Code

You can inject the `WhatsappService` into other services:

```typescript
import { Injectable } from '@nestjs/common';
import { WhatsappService } from '../whatsapp/whatsapp.service';

@Injectable()
export class MyService {
  constructor(private readonly whatsappService: WhatsappService) {}

  async sendNotification(phoneNumber: string, message: string) {
    return await this.whatsappService.sendMessage(phoneNumber, message);
  }
}
```

## Events Handled

The service automatically handles the following events:

- `ready` - Client is authenticated and ready
- `qr` - QR code received for authentication
- `authenticated` - Authentication successful
- `auth_failure` - Authentication failed
- `disconnected` - Client disconnected

## Notes

- The client needs to be authenticated (QR code scanned) before sending messages
- Authentication session is persisted, so you only need to scan the QR code once
- If the client is disconnected, you may need to restart the application
- Make sure WhatsApp Web is not already open in a browser when authenticating

