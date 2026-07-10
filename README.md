# 🏭 Production Management Software

<p>
  <img src="https://img.shields.io/badge/status-active-4C9A6A?style=for-the-badge" alt="status active">
  <img src="https://img.shields.io/badge/license-MIT-F2B705?style=for-the-badge" alt="MIT license">
  <img src="https://img.shields.io/badge/node-%3E%3D18.x-2E4057?style=for-the-badge&logo=node.js&logoColor=white" alt="node version">
  <img src="https://img.shields.io/badge/PRs-welcome-E8632C?style=for-the-badge" alt="PRs welcome">
</p>

A modern **Production Management Software** designed to streamline manufacturing operations — production planning, inventory tracking, machine and employee scheduling, quality control, and reporting — all from one system, so nothing on the floor depends on a whiteboard or a spreadsheet.

---

## 📑 Table of Contents

- [Features](#-features)
- [Tech Stack](#️-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Variables](#️-environment-variables)
- [Usage](#-usage)
- [Modules](#-modules)
- [Security](#-security)
- [Future Enhancements](#-future-enhancements)
- [Contributing](#-contributing)
- [License](#-license)
- [Author](#-author)

---

## 📌 Features

Each feature maps to a real job on the production floor — from the planner scheduling next week's run to the operator logging a finished batch.

| Feature | What it does |
|---|---|
| **Production Planning** | Schedule jobs against capacity before they hit the floor, so machines and shifts are booked, not guessed at. |
| **Production Order Management** | Every order carries its own status, quantities, and due date from creation to close. |
| **Inventory Management** | Stock levels update automatically as materials move in and finished goods move out. |
| **Raw Material Tracking** | Trace a batch back to the exact materials that went into it, by lot and supplier. |
| **Work Order Management** | Break a production order into the discrete jobs operators actually execute at each station. |
| **Employee Management** | Assign people to shifts and work orders, and track who did what. |
| **Machine Management** | Log machine status, uptime, and assignment so scheduling reflects real availability. |
| **Quality Control** | Record inspection checkpoints so defects are caught before a batch ships. |
| **Reports & Analytics** | Turn floor activity into dashboards leadership can act on. |
| **User Authentication & Role Management** | Operators, supervisors, and admins each see only what their role needs. |

---

## 🛠️ Tech Stack

A conventional MERN-style split: a browser client, a Node API, and a database that can be either document- or relational-based depending on deployment needs.

**Frontend**
- [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML)
- [CSS](https://developer.mozilla.org/en-US/docs/Web/CSS)
- [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
- [React.js](https://react.dev/) *(optional)*

**Backend**
- [Node.js](https://nodejs.org/)
- [Express.js](https://expressjs.com/)

**Database**
- [MongoDB](https://www.mongodb.com/) or [MySQL](https://www.mysql.com/)

---

## 📂 Project Structure

```
production-management/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── config/
│   └── server.js
│
├── .env
├── package.json
└── README.md
```

Client and server live side by side, each with their own dependencies, so the front end and API can be developed and deployed independently.

---

## 🚀 Installation

**1. Clone the repository**
```bash
git clone https://github.com/yaten24/production-management.git
```

**2. Navigate to the project**
```bash
cd production-management
```

**3. Install dependencies**
```bash
npm install
```

**4. Start the server**
```bash
npm start
```

---

## ⚙️ Environment Variables

Create a `.env` file in the root directory before starting the server for the first time.

```env
PORT=5000
DB_URL=your_database_url
JWT_SECRET=your_secret_key
```

| Variable | Description |
|---|---|
| `PORT` | Port the server listens on |
| `DB_URL` | Connection string for MongoDB / MySQL |
| `JWT_SECRET` | Secret key used to sign authentication tokens |

---

## 👨‍💻 Usage

This is the sequence a job actually follows once the system is live:

1. **Log in** to the system under your assigned role.
2. **Create production orders** — define what's being made, how much, and by when.
3. **Assign machines and employees** to the order.
4. **Track inventory** as raw materials draw down and finished stock builds up.
5. **Monitor production progress** through each work order and station.
6. **Generate reports** to close the loop with output, quality, and efficiency numbers.

---

## 📊 Modules

- 🧭 Dashboard — live snapshot of what's running right now
- 📦 Products — the catalog of items the factory produces
- 🧾 Production Orders — every order, its status, and its due date
- 🗃️ Inventory — current stock across raw materials and finished goods
- 🚚 Suppliers — who materials are sourced from
- 👷 Employees — roster, roles, and shift assignments
- ⚙️ Machines — equipment status and assignment
- ✅ Quality Check — inspection records at each checkpoint
- 📈 Reports — exportable output, efficiency, and quality data
- 🔧 Settings — system configuration and preferences

---

## 🔒 Security

- JWT Authentication for every session
- Password Encryption — never stored in plain text
- Role-Based Access Control per user type
- Secure API Endpoints against unauthorized calls

---

## 📈 Future Enhancements

- [ ] Barcode Scanner Integration
- [ ] QR Code Support
- [ ] AI-based Production Prediction
- [ ] Mobile Application
- [ ] Email Notifications
- [ ] SMS Alerts

---

## 🤝 Contributing

Contributions are welcome!

1. Fork the repository.
2. Create a new branch.
3. Commit your changes.
4. Push the branch.
5. Open a Pull Request.

---

## 📄 License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## 👤 Author

Yatendra Singh

[![GitHub](https://img.shields.io/badge/GitHub-yaten24-181717?style=flat-square&logo=github&logoColor=white)](https://github.com/yaten24)
[![Email](https://img.shields.io/badge/Email-yaten2404%40email.com-E8632C?style=flat-square&logo=gmail&logoColor=white)](mailto:yaten2404@email.com)