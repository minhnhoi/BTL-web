import Header from './Header';
import Sidebar from './Sidebar';

function Layout({ children }) {
  return (
    <div className="d-flex flex-column" style={{ minHeight: '100vh' }}>
      {/* Header trên cùng */}
      <Header />

      {/* Sidebar + nội dung chính */}
      <div className="d-flex flex-grow-1">
        <Sidebar />

        {/* Nội dung chính */}
        <main className="flex-grow-1 bg-light p-4" style={{ overflowY: 'auto' }}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
