# GoogleMAPsDelivery

<!-- AUTOGEN:STATS -->
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript) [![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) [![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML) [![Terminal](https://img.shields.io/badge/mac%20terminal-000000?style=for-the-badge&logo=apple&logoColor=white&labelColor=000000)](https://support.apple.com/guide/terminal/welcome/mac) [![VS Code](https://img.shields.io/badge/VS_Code-007ACC?style=for-the-badge&logo=visual-studio-code&logoColor=white)](https://code.visualstudio.com/) [![GitHub](https://img.shields.io/badge/GitHub-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/) [![Figma](https://img.shields.io/badge/Figma-F24E1E?style=for-the-badge&logo=figma&logoColor=white)](https://www.figma.com/) 

[![📊 Views](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/googlemapsdelivery/main/assets/db/visitors-badge.json)](https://github.com/VuToV-Mykola/googlemapsdelivery/graphs/traffic)
[![⭐ Stars](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/googlemapsdelivery/main/assets/db/likes-badge.json)](https://github.com/VuToV-Mykola/googlemapsdelivery/actions/workflows/screenshot-and-visitor.yaml)
[![📦 Size](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/googlemapsdelivery/main/assets/db/repo-size.json)](https://github.com/VuToV-Mykola/googlemapsdelivery)
[![📄 License](https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/VuToV-Mykola/googlemapsdelivery/main/assets/db/repo-license.json)](https://github.com/VuToV-Mykola/googlemapsdelivery/blob/main/LICENSE)

## 📸 Latest Screenshot
![Project Screenshot](assets/screenshot.png)
<!-- END:AUTOGEN -->

# Планувальник маршрутів доставки (Google Maps)

Легкий інструмент для розрахунку та візуалізації маршрутів доставки з використанням Google Maps API.

## Можливості

- Інтерактивна мапа з візуалізацією маршруту
- Планування маршруту з багатьма зупинками
- Розрахунок відстані та часу в дорозі
- Адаптивний дизайн для мобільних пристроїв та ПК

## Використання

1. Відкрийте [живу демо-версію](https://vutov-mykola.github.io/googlemapsdelivery/)
2. Додайте адреси доставки
3. Перегляньте оптимізований маршрут на мапі
4. Оцініть приблизний час та відстань

## Використані технології

- Google Maps JavaScript API
- HTML5/CSS3
- Vanilla JavaScript

## Налаштування GitHub Pages

1. Додайте repository secret `GOOGLE_MAPS_API_KEY` у `Settings → Secrets and variables → Actions`.
2. Обмежте Google Maps ключ у Google Cloud Console за доменом `https://vutov-mykola.github.io/googlemapsdelivery/*`.
3. У `Settings → Pages` оберіть `Source: GitHub Actions`.
4. Для workflow статистики додайте `PAT_TOKEN`, якщо потрібні бейджі переглядів і статистика репозиторію.

## Ліцензія

MIT
