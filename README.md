# Merchant Transactions API

## Objective

Your assignment is to build an API to manage payments transactions of our merchants. Implement the assignment
using any programming language or framework of your choice. Feel free to use the tools and
technologies you are most comfortable with.

### Provided Resources

- We have provided an API using [json-server](https://github.com/typicode/json-server) that already includes endpoints
  to manage transactions and receivables. You
  can also use json-server as a database for development purposes. **If you're unfamiliar with json-server, please take
  some time to explore its functionalities before proceeding with the assignment**.

### Task 1: Create Merchant Transactions API

The primary objective is to create a new API that processes transactions for a particular merchant.

A transaction must include:

- The total transaction amount, formatted as a decimal string.
- A description of the transaction, for example, "T-Shirt Black M".
- Payment method: **debit_card** or **credit_card**.
- The card number (only the last 4 digits should be stored and returned, as it is sensitive information).
- The name of the cardholder.
- Card expiration date in MM/YY format.
- Card CVV.

When creating a transaction, **a merchant receivable must also be created**, a receivable represents the amount
of the transaction which goes to the merchant after deducting the applicable fee.

#### Rules for Creating Receivables

| Transaction Type | Receivable Status | Payment Date                     | Fee |
|------------------|-------------------|----------------------------------|-----|
| **Debit Card**   | `paid`            | Same as creation date (D + 0)    | 2%  |
| **Credit Card**  | `waiting_funds`   | Creation date + 30 days (D + 30) | 4%  |

**Example**: If a receivable is created with a value of ARS 100.00 from a transaction with a **credit_card**, the
merchant will receive ARS 96.00.

### Task 2: Calculate Total Receivables per Period

Create an endpoint that returns the merchant's total receivables per period for a given merchant. The response should
include:

- Total amount of receivables.
- Amount receivable in the future.
- Total fee charged.

### Task 3: List All Merchant Transactions

Create an endpoint that returns all transactions for a given merchant.

## Setup

### Start provided services

```
docker compose up
```

This will expose in http://0.0.0.0:8080/ the API for managing transactions and receivables.

## API Services Overview

### Transactions

| Endpoint           | Method   | Description                                  | Request Body                                                                                                                                                                                       |
|--------------------|----------|----------------------------------------------|----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `transactions`     | `GET`    | List all transactions.                       | -                                                                                                                                                                                                  |
| `transactions/:id` | `GET`    | Get details of a specific transaction by ID. | -                                                                                                                                                                                                  |
| `transactions`     | `POST`   | Create a new transaction.                    | `{ "id": "1", "value": "250.00", "description": "T-Shirt", "method": "credit_card", "cardNumber": "2222", "cardHolderName": "Simplenube Store", "cardExpirationDate": "04/28", "cardCvv": "222" }` |
| `transactions/:id` | `DELETE` | Delete a transaction by ID.                  | -                                                                                                                                                                                                  |

### Receivables

| Endpoint          | Method   | Description                                 | Request Body                                                                                                                              |
|-------------------|----------|---------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------|
| `receivables`     | `GET`    | List all receivables.                       | -                                                                                                                                         |
| `receivables/:id` | `GET`    | Get details of a specific receivable by ID. | -                                                                                                                                         |
| `receivables`     | `POST`   | Create a new receivable.                    | `{ "id": "2", "status": "waiting_funds", "create_date": "2022-05-20T19:20:14.576-03:00", "subtotal": 240, "discount": 10, "total": 230 }` |
| `receivables/:id` | `DELETE` | Delete a receivable by ID.                  | -                                                                                                                                         |
