import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/hubot-sans/400.css'
import '@fontsource/hubot-sans/500.css'
import '@fontsource/hubot-sans/600.css'
import '@fontsource/hubot-sans/700.css'
import '@fontsource/hubot-sans/800.css'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import store from './redux/store.js'
import { ThemeProvider } from './context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Provider store={store}>
        <ThemeProvider>
          <App />
        </ThemeProvider>
      </Provider>
    </BrowserRouter>
  </StrictMode>,
)
