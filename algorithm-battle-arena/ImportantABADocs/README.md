# CSP_Project - Algorithm Battle Arena

A **real-time competitive coding platform** built with modern .NET and web technologies.  
Players face off head-to-head, solving algorithm problems while **live leaderboards** update in real-time.  

---

##  Features  

-  **User Authentication & Profiles** – secure login and player stats  
-  **Problem Library (CRUD)** – manage algorithm challenges  
-  **Real-Time Matchmaking & Contests** – powered by SignalR  
-  **Live Leaderboards** – optimized with Dapper queries  
-  **Admin Dashboard** – analytics and system insights  

---


## 🛠 Tech Stack  

**Backend:**  
- ASP.NET Core 8 (Web API + SignalR)  
- Entity Framework Core (MySQL)  
- Dapper (optimized queries)
- Entity Framework

**Frontend:**  
- React  

**Database:**  
- MSSQL  

**CI/CD & Deployment:**  
- GitHub Actions
- Azure  

**Testing:**  
- xUnit (unit & integration tests)  
- Selenium (end-to-end testing)  

---

##  Getting Started  

### Prerequisites  
- [.NET 8 SDK](https://dotnet.microsoft.com/)  
- [Node.js](https://nodejs.org/) (if using React frontend)  
- [MySQL 8](https://dev.mysql.com/)  

### Setup  

```bash
# Clone repo
git clone https://github.com/yourusername/algorthm-battle-arena.git
cd algorthm-battle-arena

# Backend setup (Dotnet)
cd AlgorithmBattleArena
dotnet run

# Frontend setup (React)
cd AlgorithmBattleArenaFrontend
npm install
npm start
```

### APIs
See Docs/api.md for the current list of API endpoints.


### Deployment
We use Github Actions and Azure for CI/CD
- On push to dev, tests + builds run automatically.
- On merge to main, tests and build the project and deploys to Azure Web App.

### Contributing
  1) Fork the repo
  2) Create a feature branch (git checkout -b feature/awesome)
  3) Stage your changes (git add .)
  4) Commit your changes (git commit -m 'Add awesome feature')
  5) Push to branch (git push origin feature/awesome)
  6) Create a PR
