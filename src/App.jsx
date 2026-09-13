// The site's route table (R3). Every page renders inside SiteLayout, the pathless layout route
// that supplies the navbar and the contact footer on every address (R4).
import { Route, Routes } from 'react-router';
import CaseStudyPage from './components/CaseStudyPage';
import SiteLayout from './components/SiteLayout';
import HomePage from './pages/HomePage';
import NotFoundPage from './pages/NotFoundPage';
import WorkIndexPage from './pages/WorkIndexPage';

export default function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route index element={<HomePage />} />
        <Route path="work" element={<WorkIndexPage />} />
        <Route path="work/:slug" element={<CaseStudyPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
