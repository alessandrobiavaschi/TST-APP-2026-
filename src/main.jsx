import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { UiSoundProvider, UiSoundGlobalListener } from './UiSoundProvider.jsx'
import { SkyThemeProvider } from './SkyThemeContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SkyThemeProvider>
        <UiSoundProvider>
          <UiSoundGlobalListener />
          <App />
        </UiSoundProvider>
      </SkyThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
