# Codeforces Monolith (CF Monolith) 🚀

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Platform](https://img.shields.io/badge/Platform-Chrome-blue.svg)](https://chromewebstore.google.com/)
[![Manifest](https://img.shields.io/badge/Manifest-V3-orange.svg)](https://developer.chrome.com/docs/extensions/mv3/intro/)

**CF Monolith** is a unified, lightweight training workspace and analytics ecosystem designed specifically for competitive programmers on the Codeforces platform. Engineered natively on Chrome's modern **Manifest V3** framework, it consolidates a suite of advanced productivity tools into a single, highly optimized interface overlay—eliminating browser tab clutter and streamlining training workflows.

[Install from the Chrome Web Store] - (link will be added soon)

##  Core Features

* **📊 Interactive Compare Dashboard:** Instantly generate visual analytical overlays comparing your submitted and attempted problems alongside rivals or friends with deep-dive chart tracking.
* **🔮 Predictive Analytics for Unrated Problems:** Real-time difficulty estimations evaluating unique problem parameters to help scale your training sets accurately.
* **👑 Famous Solvers Tracking Dashboard:** Pin elite solvers to monitor active submission patterns, problem choices, and implementation speeds.
* **🙈 Native 'Hide Tags' Toggle:** Simulate realistic contest environments by hiding tags across problem sets while keeping ratings perfectly visible for guidance.
* **🛡️ Behavioral Mistake Analyzer:** Parses historical submission data to isolate the specific algorithmic tags generating high 'Wrong Answer' (WA) verdicts.
* **🎯 Algorithmic Recommendations:** Performance-tailored training recommendations mathematically calibrated to your current user rating.
* **🎨 UI Modernization & Dark Mode:** A native, system-wide dark mode stylesheet optimized to minimize eye strain during late-night contest grinds.
* **🇮🇳 India Rank Tracking:** Integrated regional leaderboards to view precise, calculated geo-rankings on any active contest.
* **📝 In-Context Problem Notes:** Maintain training continuity by writing and auto-saving edge cases or pitfalls directly on the active problem page.

## 🛠️ Tech Stack & Architecture

* **Frontend Architecture:** Vanilla JavaScript, HTML5, CSS3 (Custom Theme Engines)
* **API Integration:** Asynchronous communication with the official public Codeforces API endpoints.
* **Extension Specifications:** Chrome Extension Manifest V3 (leveraging declarative content scripts, secure local storage caching, and localized service workers).

## 🔒 Privacy, Security & Privilege Assurance

* **Principle of Least Privilege:** Extension permissions are strictly sandboxed and isolated exclusively to the `https://codeforces.com` domain namespace. It requests zero global tracking privileges.
* **100% Client-Side Execution:** Telemetry, analytical data processing, and workspace notes are computed and cached entirely locally on your machine.
* **Zero Data Transmissions:** We do not monetize, transmit, or collect personal data, telemetry, or Codeforces credentials.

## 📄 License

This project is open-source and licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details. 

Feel free to fork this project, open issues, or submit Pull Requests to improve the competitive programming workflow for everyone!
