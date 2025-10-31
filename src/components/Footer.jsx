export default function AttributionFooter() {
  return (
    <footer className="footer"
      style={{
        
      }}
    >
        <p className="footer-p">Developed by Nick Massagli, Dylan Petersen, and Kaylee Wright ©2025</p>
      Powered by{" "}
      <a
        href="https://www.geoapify.com/"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)" }}
      >
        Geoapify
      </a>{" "}
      · Data ©{" "}
      <a
        href="https://www.openstreetmap.org/copyright"
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "var(--color-primary)", fontWeight: "var(--font-weight-semibold)" }}
      >
        OpenStreetMap contributors
      </a>
    </footer>
  );
}
