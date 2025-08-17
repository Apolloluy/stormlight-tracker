# App Requirements

Site needs to be able to create encounters that can track enemies and players.
Rounds have Fast and Slow both enemies and players.
Enemies should have configs to default fast/slow.
All entities should be draggable or an easy toggle between the two between each round
Round tracker should be present on the top.

Entity cards should be able to track status effects.
Status effects are conditions or Investiture tracking.
Entity cards should be able to track reaction usage between rounds.
Have to be able to save the state/configurations between page refreshes (auto saves).
Should be able to have an admin page to modify the storage mechanism (local storage within the app is fine).



## Features List
### Components
- Entity
  - Name
  - Coloring based on enemy or player
  - image
- Status https://mui.com/material-ui/react-avatar/#icon-avatars
- Fast/Slow holders
- Round tracking
- Encounter creation
- library of enemies?
- Load encounter

### Actions
- Load entities
  - https://mui.com/material-ui/react-divider/
- Move between slow and fast (drag)
  - https://react-dnd.github.io/react-dnd/docs/api/dnd-provider
- Add statuses
- Remove statuses
- Remove Reaction
- Renable Reactions on next round
- Next round
- Auto slow or fast on load
- encounter UI vs load UI

#### Bonus
- When a character becomes empowered during combat (aka said the words) their box should get glowy lightning effects.



# copilot output
Here’s a plan for building your app, along with style library recommendations:

1. Style Library Recommendation
For React apps that need ready-to-use, attractive UI components, consider these options:

MUI (Material-UI): Modern, highly customizable, large component library, good docs, easy theming.
React Bootstrap: Bootstrap-based, familiar look, lots of prebuilt components.
Ant Design: Enterprise-grade, lots of components, clean design.
Recommendation:
Use MUI (Material-UI). It’s popular, well-documented, and provides a wide range of components (cards, buttons, forms, drag-and-drop, etc.) that will help you quickly build a polished UI.

2. Project Plan
Phase 1: Setup & Core Structure
Install MUI: npm install @mui/material @emotion/react @emotion/styled
Set up routing (if needed) with react-router-dom.
Create basic page structure: Encounter UI, Load UI, Admin UI.
Phase 2: Core Components
Entity Card:
Name, image, color (enemy/player), status effects, reaction tracking.
Use MUI Card, Avatar, Chip, etc.
Status Effect Tracking:
Use MUI Chips or Badges for conditions/investiture.
Fast/Slow Holders:
Use MUI Tabs, Lists, or custom drag-and-drop zones.
Round Tracker:
Top bar with round info, fast/slow toggles.
Encounter Creation/Loading:
Forms for adding entities, saving/loading encounters.
Phase 3: Interactivity
Drag-and-Drop:
Use MUI + react-beautiful-dnd or MUI’s built-in drag features.
Status/Reaction Management:
Toggle, add, remove statuses/reactions.
Round Progression:
Next round button, auto-reset reactions.
Phase 4: Persistence
Auto-save State:
Use localStorage for entity/encounter state.
Admin Page:
UI for viewing/modifying stored data.
Phase 5: Polish & Testing
Responsive design (MUI is mobile-friendly).
Add images/icons for entities.
Write tests for key components and logic.
Let me know if you want a more detailed breakdown or help with the initial setup!

# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).


