import './Navbar.css'

const Navbar = () => {
    return (
        <div className="navbar">
            <div className="navbar-brand">
                🏏 ScoreCard
            </div>
            <ul className="navbar-links">
                <li><a href="#">Home</a></li>
                <li><a href="#">About</a></li>
            </ul>
        </div>
    )
}

export default Navbar