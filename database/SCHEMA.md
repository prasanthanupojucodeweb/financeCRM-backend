# FinTrackr — MongoDB schema (Mongoose)

Collections map to models below. Each business record is scoped to a **User** so Prasanth and Bhavani only see their own data.

## Users (`users`)

| Field     | Type   | Notes              |
| --------- | ------ | ------------------ |
| `_id`     | ObjectId | Primary key (`id`) |
| `name`    | String | Required           |
| `email`   | String | Required, unique   |
| `password`| String | Required, hashed   |
| `createdAt` / `updatedAt` | Date | From `timestamps` |

## Clients (`clients`)

| Field     | Type     | Notes                          |
| --------- | -------- | ------------------------------ |
| `_id`     | ObjectId | Primary key                    |
| `name`    | String   | Required                       |
| `company` | String   | Optional                       |
| `email`   | String   | Optional                       |
| `phone`   | String   | Optional                       |
| `notes`   | String   | Optional                       |
| `user`    | ObjectId | Ref `User`, required — owner  |
| `createdAt` / `updatedAt` | Date | Timestamps             |

## Projects (`projects`)

| Field         | Type     | Notes                         |
| ------------- | -------- | ----------------------------- |
| `_id`         | ObjectId | Primary key                   |
| `client`      | ObjectId | Ref `Client` — **client_id**  |
| `name`        | String   | Required — project name       |
| `description` | String   | Optional                      |
| `user`        | ObjectId | Ref `User`, required — owner |
| `createdAt` / `updatedAt` | Date | Timestamps            |

## Invoices (`invoices`)

| Field      | Type     | Notes                          |
| ---------- | -------- | ------------------------------ |
| `_id`      | ObjectId | Primary key                    |
| `client`   | ObjectId | Ref `Client` — **client_id**   |
| `project`  | ObjectId | Ref `Project` — **project_id** |
| `amount`   | Number   | Required                       |
| `currency` | String   | Default `INR`                  |
| `status`   | String   | `Paid` \| `Pending` \| `Overdue` |
| `dueDate`  | Date     | Required                       |
| `user`     | ObjectId | Ref `User`, required — owner   |
| `createdAt` / `updatedAt` | Date | `created_at` + updates |

## Expenses (`expenses`)

| Field      | Type     | Notes                          |
| ---------- | -------- | ------------------------------ |
| `_id`      | ObjectId | Primary key                    |
| `title`    | String   | Required                       |
| `category` | String   | Required                       |
| `amount`   | Number   | Required                       |
| `date`     | Date     | Required                       |
| `project`  | ObjectId | Ref `Project`, optional — **project_id** |
| `user`     | ObjectId | Ref `User`, required — owner   |
| `createdAt` / `updatedAt` | Date | Timestamps             |
