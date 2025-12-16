
import React from 'react'
import ReactDOM from 'react-dom/client'
import RootRouter from './RootRouter'
import './styles/index.css'

// Debug: help detect whether the main module executes in the browser
console.log('[debug] src/main.tsx loaded')

try {
	ReactDOM.createRoot(document.getElementById('root')!).render(
		<React.StrictMode>
			<RootRouter />
		</React.StrictMode>
	)
	console.log('[debug] ReactDOM.render finished')
} catch (err) {
	// Surface any synchronous errors that might otherwise be swallowed
	// (e.g. if root is null or render throws)
	// eslint-disable-next-line no-console
	console.error('[debug] Error during React render:', err)
	throw err
}
