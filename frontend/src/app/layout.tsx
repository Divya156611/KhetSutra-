import type { Metadata } from 'next';
import './globals.css';
import { AppProvider } from '../context/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import BottomNav from '../components/BottomNav';

export const metadata: Metadata = {
  title: 'Kisan Mitra AI — Smart Farming. Smarter Decisions.',
  description: 'AI-Powered Smart Farming & Agricultural Decision Support Platform for Indian Farmers. ICAR & IMD aligned real-time decisions.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="hi" suppressHydrationWarning>
      <body className="antialiased bg-slate-50 text-slate-900 font-sans selection:bg-fresh selection:text-forest-950">
        <AppProvider>
          <div className="flex min-h-screen">
            {/* Desktop 14-item Sidebar */}
            <Sidebar />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 pb-20 lg:pb-10">
              <Header />
              <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
                {children}
              </main>
            </div>
          </div>

          {/* Mobile Bottom Navigation */}
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}
