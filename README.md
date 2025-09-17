# Campus-Navigation-Using-Web-GIS
This project is to create a Campus map for easy navigation using Web GIS
+52
-1

# Campus-Navigation-Using-Web-GIS
This project is to create a Campus map for easy navigation using Web GIS

A minimal Web GIS project for campus navigation built with Leaflet and Bootstrap. It displays multiple campus layers and runs entirely in the browser.

## Project Structure
```
campus-webgis/
├── index.html
├── css/
│   └── style.css
├── js/
│   └── map.js
├── data/
│   ├── Administration.geojson
│   ├── Business Points.geojson
│   ├── Departments.geojson
│   ├── Facilities.geojson
│   ├── Halls.geojson
│   ├── Hostels.geojson
│   ├── Houses.geojson
│   ├── Main Road.geojson
│   ├── Parks and Courts.geojson
│   ├── Paths.geojson
│   ├── SHS Dormitories.geojson
│   ├── Teachers Quarters.geojson
│   ├── Trees.geojson
│   ├── Workshops.geojson
│   ├── Boundary.geojson
│   └── parks.geojson
└── img/
    └── logo.png
```

## Hosting on GitHub Pages
1. Commit all files to the `main` branch.
2. Push to GitHub.
3. In the repository settings, enable **GitHub Pages** using the `main` branch.
4. Your map will be available at `https://<username>.github.io/<repository>/`.

## Hosting on Netlify
1. Sign up at [Netlify](https://www.netlify.com/) and connect your GitHub account.
2. Create a new site and select this repository.
3. Use the default build settings (no build command needed).
4. Deploy; Netlify will provide a URL like `https://<site-name>.netlify.app`.

## Features
- Leaflet base map with OpenStreetMap tiles
- Layer control for campus datasets
- Popups with attribute details
- Search by feature name
- Geolocation button to show current position

Replace the sample GeoJSON files in `data/` with real exports from QGIS to customize the map.