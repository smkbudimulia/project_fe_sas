export default function Footer() {
    return (
      <footer className="bg-slate-100 text-white py-6 relative shadow-md z-0">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-teal-500">
             Developed by IT BMDev and SIJA major.
          </p>
          <p className="text-sm text-teal-500">Copyright &copy; {new Date().getFullYear()} | Budi Mulia Vocational High School</p>
        </div>
      </footer>
    );
}