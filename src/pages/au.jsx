const AboutPage = () => {
  return (
    <><Navbar/>
    <div className="font-sans bg-white text-gray-800 flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative h-96 overflow-hidden">
        <img 
          src= {aboutImage} 
          alt="Photographer capturing wedding moment"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/30 bg-opacity-40 flex items-center justify-center">
          <div className="text-center px-4">
            <h1 className="text-4xl md:text-5xl font-bold text-white text-shadow mb-4"></h1>
            <p className="text-xl text-white text-shadow max-w-2xl mx-auto"></p>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-16 flex-grow">
        {/* About Section */}
        <section className="mb-20">
          <div className="flex flex-col md:flex-row items-center gap-12">
            <div className="md:w-1/2">
              <img 
                src="" 
                alt="Our team working together"
                className="rounded-lg shadow-xl"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6">Who We Are</h2>
              <p className="text-lg mb-4">Founded in 2015, EverAfter Visuals is a collective of passionate photographers and videographers dedicated to preserving your most precious moments.</p>
              <p className="text-lg mb-6">With over 25 years of combined experience in the wedding industry, we blend technical expertise with artistic vision to create timeless imagery that tells your unique love story.</p>
              <div className="flex items-center space-x-4">
                <div className="w-12 h-1 bg-brand"></div>
                <span className="text-brand font-medium">Our Philosophy</span>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Meet The Team</h2>
            <p className="text-lg max-w-2xl mx-auto">We're more than just photographers - we're storytellers, romantics, and your biggest cheerleaders on your wedding day.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Team Member 1 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src="" 
                alt="Lead Photographer"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Alex Morgan</h3>
                <p className="text-brand mb-4">Lead Photographer</p>
                <p className="text-gray-600">With an eye for detail and a passion for natural light, Alex captures the emotion and beauty of your day.</p>
              </div>
            </div>

            {/* Team Member 2 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src="" 
                alt="Videographer"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Jamie Chen</h3>
                <p className="text-brand mb-4">Videographer & Editor</p>
                <p className="text-gray-600">Jamie's cinematic approach transforms your wedding footage into a moving work of art you'll cherish forever.</p>
              </div>
            </div>

            {/* Team Member 3 */}
            <div className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
              <img 
                src="" 
                alt="Second Photographer"
                className="w-full h-64 object-cover"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold mb-1">Taylor Williams</h3>
                <p className="text-brand mb-4">Second Photographer</p>
                <p className="text-gray-600">Taylor specializes in candid moments, ensuring no precious smile or tear goes undocumented.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Approach Section */}
        <section className="bg-gray-50 rounded-xl p-12 mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Our Approach</h2>
            <p className="text-lg max-w-3xl mx-auto">We believe wedding photography should be as unique as your love story. Here's how we make that happen:</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCamera className="h-8 w-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold mb-3">Artistic Storytelling</h3>
              <p className="text-gray-600">We don't just take photos - we craft visual narratives that reflect your personality and the emotions of your day.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUserSecret className="h-8 w-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold mb-3">Discreet Presence</h3>
              <p className="text-gray-600">We blend into your celebration, capturing authentic moments without intrusion or excessive direction.</p>
            </div>

            <div className="text-center p-6">
              <div className="w-16 h-16 bg-brand bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaBoxOpen className="h-8 w-8 text-brand" />
              </div>
              <h3 className="text-xl font-bold mb-3">Premium Products</h3>
              <p className="text-gray-600">From heirloom albums to 4K cinematic films, we deliver museum-quality products designed to last generations.</p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-brand bg-opacity-10 rounded-xl p-12 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Document Your Love Story?</h2>
          <p className="text-lg mb-8 max-w-2xl mx-auto">We'd love to hear about your wedding plans and how we can help preserve your special day.</p>
          <a href="#" className="bg-brand text-white px-8 py-3 rounded-full font-medium hover:bg-opacity-90 transition">Get in Touch</a>
        </section>
      </div>

      {/* Footer */}
      
    </div><Footer/></>
  );
};

export default AboutPage;