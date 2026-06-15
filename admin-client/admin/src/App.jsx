import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/context/AuthContext'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { AdminLayout } from '@/components/layout/AdminLayout'
import Login from '@/pages/Login'
import Dashboard from '@/pages/Dashboard'
import NewsPage from '@/pages/NewsPage'
import NewsFormPage from '@/pages/NewsFormPage'
import ProgramsPage from '@/pages/ProgramsPage'
import ProgramFormPage from '@/pages/ProgramFormPage'
import GalleryPage from '@/pages/GalleryPage'
import GalleryFormPage from '@/pages/GalleryFormPage'
import ImpactPage from '@/pages/ImpactPage'
import TendersPage from '@/pages/TendersPage'
import TenderFormPage from '@/pages/TenderFormPage'
import DonationsPage from '@/pages/DonationsPage'
import {
  ContactSubmissionsPage,
  VolunteerSubmissionsPage,
  PartnershipSubmissionsPage,
  NewsletterPage,
} from '@/pages/SubmissionsPage'
import UsersPage from '@/pages/UsersPage'
import UserFormPage from '@/pages/UserFormPage'
import SettingsPage from '@/pages/SettingsPage'
import NotFound from '@/pages/NotFound'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route index element={<Dashboard />} />

              <Route element={<ProtectedRoute section="content" />}>
                <Route path="news" element={<NewsPage />} />
                <Route path="news/new" element={<NewsFormPage />} />
                <Route path="news/:id/edit" element={<NewsFormPage />} />
                <Route path="programs" element={<ProgramsPage />} />
                <Route path="programs/new" element={<ProgramFormPage />} />
                <Route path="programs/:id/edit" element={<ProgramFormPage />} />
                <Route path="gallery" element={<GalleryPage />} />
                <Route path="gallery/new" element={<GalleryFormPage />} />
                <Route path="gallery/:id/edit" element={<GalleryFormPage />} />
                <Route path="impact" element={<ImpactPage />} />
              </Route>

              <Route element={<ProtectedRoute section="settings" />}>
                <Route path="settings" element={<SettingsPage />} />
              </Route>

              <Route element={<ProtectedRoute section="tenders" />}>
                <Route path="tenders" element={<TendersPage />} />
                <Route path="tenders/new" element={<TenderFormPage />} />
                <Route path="tenders/:id/edit" element={<TenderFormPage />} />
              </Route>

              <Route element={<ProtectedRoute section="donations" />}>
                <Route path="donations" element={<DonationsPage />} />
              </Route>

              <Route element={<ProtectedRoute section="submissions" />}>
                <Route path="submissions/contact" element={<ContactSubmissionsPage />} />
                <Route path="submissions/volunteers" element={<VolunteerSubmissionsPage />} />
                <Route path="submissions/partnerships" element={<PartnershipSubmissionsPage />} />
                <Route path="submissions/newsletter" element={<NewsletterPage />} />
              </Route>

              <Route element={<ProtectedRoute section="users" />}>
                <Route path="users" element={<UsersPage />} />
                <Route path="users/new" element={<UserFormPage />} />
                <Route path="users/:id/edit" element={<UserFormPage />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
