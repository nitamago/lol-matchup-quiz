import "./Footer.css";

export default function Footer() {
  return (
    <footer className="footer">
        © {new Date().getFullYear()} nitamago.
        <p>
            開発者: 
            <a href="https://x.com/NitamagoVaingl1" target="_blank" rel="noopener noreferrer">
                @NitamagoVaingl1
            </a>
        </p>
    </footer>
  );
}
