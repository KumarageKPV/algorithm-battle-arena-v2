# ENVISION SUBMISSION

Organized by the IEEE Student Branch of IIT in collaboration with the IEEE Computer Society Student Branch Chapter of IIT, IEEE Robotics and Automation Society Student Branch of IIT, IEEE Computational Intelligence Society Student Branch of IIT and the IEEE Women In Engineering Affinity Group of IIT

**Team Number**: CS11-197
**Team Name**: Pathfinders
**University**: Sri Lanka Institute of Information Technology
**Project Subtrack**: Track 01 - Platforms
**ALGORITHM BATTLE ARENA**

---

## 1. PROBLEM DEFINITION & BACKGROUND

### 1.1. Problem Statement
Current educational environments lack engaging and interactive platforms for students to practice algorithmic problem-solving in real-time against peers and educators, leading to diminished interest and lower proficiency in competitive programming and technical interviews.

### 1.2. Problem Background
In today's highly competitive tech industry, algorithmic proficiency is paramount. Yet, traditional learning methods often fail to motivate students. Many existing coding platforms are isolated, single-player experiences that lack the thrill of competition and real-time mentorship. This disconnect results in students struggling to apply algorithms under pressure, a critical skill for both hackathons and technical job interviews.

### 1.3. Research Background
Studies in pedagogical strategies show that gamification and peer-to-peer competition significantly boost student engagement and retention rates. Research indicates that incorporating game mechanics into learning environments, such as leaderboards and live challenges, improves problem-solving speeds and algorithmic comprehension compared to conventional study methods.

### 1.4. In-Scope & Out-Scope
**In-Scope:**
- Real-time multiplayer coding battles (Students vs. Teachers / Student vs. Student).
- Comprehensive set of algorithmic problems with automated code execution and sandboxing.
- Real-time chat, matchmaking lobbies, and dynamic leaderboards.
- Role-based access control (Student, Teacher, Admin).

**Out-Scope:**
- Video or voice communication features.
- Full-fledged IDE functionalities (e.g., heavy offline debugging tools).

### 1.5. User Pain Points
- Lack of motivation to practice coding problems alone.
- Absence of real-time feedback and direct interaction with instructors during problem-solving.
- Difficulty simulating the time-pressured environment of actual technical interviews.
- Complicated setups required to test and rank code performance accurately.

---

## 2. Proposed Solution

### 2.1. One-Line Pitch
Algorithm Battle Arena is a real-time, competitive coding platform that gamifies algorithmic learning through live multiplayer matches between students and educators.

### 2.2. Solution Overview
The platform allows users to create or join live match lobbies where they compete to solve algorithmic challenges in real-time. It features a scalable Node.js/NestJS backend with WebSockets for real-time multiplayer synchronization, integration with a secure code execution sandbox (Judge0), and a dynamic React/Next.js frontend. Users can chat, write code in the browser, and receive instant execution results and leaderboard updates.

### 2.3. Purpose & Impact
The primary goal is to make learning algorithms exciting and collaborative. By pitting students against each other or their teachers, it fosters a community of continuous improvement. The expected impact includes higher student engagement, better preparation for technical interviews, and a scalable platform that educational institutions can adopt.

### 2.4. Ethical & Social Impact
The platform democratizes access to competitive programming by providing a free-to-use tier. It incorporates secure sandboxing to prevent malicious code execution, ensuring a safe learning environment. By promoting fairness and skill-based matching, it encourages a positive and inclusive engineering culture.

### 2.5. Uniqueness & Special Features
Unlike typical coding platforms (like LeetCode or HackerRank) which are solitary, ours focuses on live, head-to-head multiplayer battles. Special features include Real-Time Match Lobbies, Live Chat, and instant, sandboxed execution with zero local setup.

---

## 3. Market & Industry Analysis

### 3.1. Target Audience & Market Size
**Primary Audience:** Computer Science students aiming to improve algorithms and data structures.
**Secondary Audience:** Teachers and educational institutions seeking engaging ways to assess students, and tech companies looking to host coding challenges.
The global EdTech market and developer assessment market are rapidly expanding, indicating massive potential user bases ranging in millions of computer science students globally.

### 3.2. Market Potential & Importance
As the tech industry continues to grow, clear algorithmic prowess remains the primary gatekeeper for software engineering roles. The demand for interactive and gamified learning platforms is at an all-time high, presenting a strong opportunity for a specialized, real-time coding platform.

---

## 4. Business & Financial Model

### 4.1. Business Revenue Model & Cost Structure
**Revenue Model:**
- Freemium tier for public lobbies and basic metrics.
- Subscription models for educational institutions (proctoring, custom problem sets, advanced analytics).
- Sponsored tournaments hosted by tech companies.
**Cost Structure:**
- Cloud hosting, database management, and code execution engine (Judge0) operational costs.
- Initial development and continuous maintenance.

### 4.2. Initial Go-to-Market Strategy
Partner with university computer science departments and tech clubs to pilot the platform through campus-wide coding tournaments. Use organic social media marketing targeting CS students and early technical interview preppers.

### 4.3. Partnerships & Funding Strategies
Seek initial funding through educational grants, tech startup accelerators, and IEEE-sponsored technical competitions. Partner with tech recruitment firms to use the platform as an assessment tool.

---

## 5. Implementation

### 5.1. Tech Stack (Overview)
- **Frontend:** Next.js (React) for a highly responsive, component-driven UI.
- **Backend:** NestJS (Node.js) with Socket.IO for robust, real-time API and WebSocket management.
- **Database:** PostgreSQL for relational data and Redis for Pub/Sub and caching.
- **Code Execution:** Judge0 (Docker sandboxed) for secure, scalable code evaluation.

### 5.2. Impact on Stakeholders
- **Students:** Gain a highly engaging platform to practice under pressure.
- **Teachers:** Acquire a tool to monitor, assess, and interact with students dynamically.
- **Institutions:** Improve overall graduate employability rates in technical fields.

### 5.3. Onion Diagram
(Visual representation description)
- **Core:** Active Students and Teachers.
- **Inner Layer:** University Tech Clubs and Course Instructors.
- **Outer Layer:** Tech Companies and Sponsors.

### 5.4. Real-World Scenarios & User Journey
1. **Login:** Student logs in and lands on the dashboard.
2. **Matchmaking:** Student joins an open lobby or accepts a challenge from a teacher.
3. **The Battle:** The match starts; both parties receive the problem statement. The live editor tracks code. 
4. **Execution:** Code is submitted, executed safely in Judge0, and results/scores update instantly.
5. **Review:** Post-match analytics are displayed on the leaderboard.

---

## 6. Project Management

### 6.1. Project Management Approach
We will utilize the Agile methodology, specifically Scrum, with 2-week sprints. This allows for iterative development, frequent testing of the critical real-time features, and continuous integration of user feedback.

### 6.2. Project Timeline & Milestones
- **Month 1:** Define schema, setup CI/CD, and establish basic authentication and MVP UI.
- **Month 2:** Develop the core WebSocket matchmaking and integrate Judge0 for code execution.
- **Month 3:** Implement leaderboards, chat, and role-based access. Beta release for testing.
- **Month 4:** Refine UX, optimize scaling with Redis, and final launch.

### 6.3. Team Roles & Responsibilities
- **Project Manager / Lead Developer:** Oversee architecture, timeline, and core backend logic.
- **Frontend Engineer:** Develop Next.js UI, manage state and real-time socket connections on the client side.
- **Backend Engineer:** Build NestJS REST APIs, WebSockets, and database integrations.
- **DevOps/QA Engineer:** Setup Docker, Judge0 sandboxes, CI/CD pipelines, and rigorous structural testing.

---

## 7. Additional and Supportive Materials (Optional)
*See attached visual diagrams for Scalable WebSocket Architecture, Tech Stack Map, and UI Wireframes (Submitted via zip).*

---

## 8. Team

**Team Leader Name** – K P V Kumarage
NIC - 200129803730
Email – pavanvilhan@gmail.com
Contact No. - 0713560640

**Member 2 Name** - [To Be Assigned]
NIC -
Email -
Contact No. -

**Member 3 Name** - [To Be Assigned]
NIC -
Email -
Contact No. -

**Member 4 Name** - [To Be Assigned]
NIC -
Email -
Contact No. -

**Member 5 Name** - [To Be Assigned]
NIC -
Email -
Contact No. -

