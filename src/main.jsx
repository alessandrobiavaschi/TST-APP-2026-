import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { UiSoundProvider, UiSoundGlobalListener } from './UiSoundProvider.jsx'
import { SkyThemeProvider } from './SkyThemeContext.jsx'
import { AdaptiveFlowProvider } from './AdaptiveFlowContext.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <SkyThemeProvider>
        <AdaptiveFlowProvider>
          <UiSoundProvider>
            <UiSoundGlobalListener />
            <App />
          </UiSoundProvider>
        </AdaptiveFlowProvider>
      </SkyThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
