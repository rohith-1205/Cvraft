import { useNavigate } from 'react-router-dom';

const About = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-6">
          <button
            onClick={() => navigate(-1)}
            className="mb-4 text-blue-100 hover:text-white transition"
          >
            ← Back
          </button>
          <h1 className="text-4xl font-bold">About Cvraft</h1>
          <p className="text-blue-100 mt-2">Helping you build your dream career</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="space-y-8 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Our Mission</h2>
            <p>
              Cvraft was founded with a simple goal: to help job seekers create professional, eye-catching resumes that stand out in today's competitive job market. We believe that everyone deserves a chance to showcase their skills and experiences in the best possible light.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">What We Offer</h2>
            <p>
              Our platform provides intuitive tools and professionally designed templates to help you craft a resume that truly represents your professional journey. Whether you're just starting out or are a seasoned professional, Cvraft has everything you need to build a compelling resume.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Us?</h2>
            <ul className="list-disc list-inside space-y-2">
              <li>Easy-to-use resume builder</li>
              <li>Professionally designed templates</li>
              <li>Real-time preview</li>
              <li>Secure data storage</li>
              <li>Responsive customer support</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
};

export default About;
