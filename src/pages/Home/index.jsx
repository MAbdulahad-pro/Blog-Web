import Navbar from '../Navbar/index';
import Hero from '../Hero/index';
import Lifestyle from '../CategorySection/index';
import Scrolling_post from '../scrolling-post/index';
import Footer from '../Footer/index';

const Home = () => {
    return (
        <>
            <Navbar />
            <Hero />
            <Lifestyle />
            <Scrolling_post />
            <Footer />
        </>
    )
}

export default Home;