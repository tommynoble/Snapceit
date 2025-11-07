import React from 'react';
import { LogIn, Bell, Search, User, Settings, Menu } from 'lucide-react';
import { motion } from 'framer-motion';
import PrimaryButton from './ui/PrimaryButton';
import SecondaryButton from './ui/SecondaryButton';
import TertiaryButton from './ui/TertiaryButton';

const StyleGuide = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <h1 className="text-[2.1rem] sm:text-4xl lg:text-5xl font-bold mb-8 sm:mb-12 lg:mb-16 text-gray-900 leading-tight">Snapceit Style Guide</h1>
        
        {/* Typography Section */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Typography</h2>
          
          <div className="space-y-8 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <div>
              <h1 className="text-[2.1rem] sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">Heading 1</h1>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">text-[2.1rem] sm:text-4xl lg:text-5xl font-bold leading-tight</code>
              </div>
              <p className="text-gray-600 font-paragraph mt-2">Used for main page titles and hero sections (40px on mobile)</p>
            </div>
            
            <div>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">Heading 2</h2>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">text-2xl sm:text-3xl lg:text-4xl</code>
              </div>
              <p className="text-gray-600 font-paragraph mt-2">Used for section headers</p>
            </div>
            
            <div>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">Heading 3</h3>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">text-xl sm:text-2xl lg:text-3xl</code>
              </div>
              <p className="text-gray-600 font-paragraph mt-2">Used for subsection headers</p>
            </div>
            
            <div>
              <h4 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900">Heading 4</h4>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">text-lg sm:text-xl lg:text-2xl</code>
              </div>
              <p className="text-gray-600 font-paragraph mt-2">Used for card titles and smaller sections</p>
            </div>
            
            <div>
              <p className="text-base sm:text-lg lg:text-xl font-paragraph text-gray-900">Body Large</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">text-base sm:text-lg lg:text-xl</code>
              </div>
              <p className="text-gray-600 font-paragraph mt-2">Used for important paragraphs and featured text</p>
            </div>
            
            <div>
              <p className="text-sm sm:text-base lg:text-lg font-paragraph text-gray-900">Body Regular</p>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">text-sm sm:text-base lg:text-lg</code>
              </div>
              <p className="text-gray-600 font-paragraph mt-2">Used for regular paragraph text</p>
            </div>
          </div>
        </section>
        
        {/* Colors Section */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-6">Colors</h2>
          
          <div className="space-y-8 bg-white p-8 rounded-xl shadow-lg border border-purple-100 mb-12">
            <div>
              <h3 className="text-h3 mb-6 text-gray-900">Gradient Backgrounds</h3>
              <div className="space-y-4">
                <div>
                  <div className="h-24 bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900 rounded-lg"></div>
                  <p className="text-gray-600 font-paragraph mt-2">Primary Gradient (Hero & Header)</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">bg-gradient-to-br from-[#D444EF] via-[#AF3AEB] to-purple-900</code>
                  </div>
                </div>
                
                <div>
                  <div className="h-24 bg-gradient-to-b from-white to-purple-50 rounded-lg border border-gray-100"></div>
                  <p className="text-gray-600 font-paragraph mt-2">Secondary Gradient (Content Background)</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">bg-gradient-to-b from-white to-purple-50</code>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-h3 mb-6 text-gray-900">Solid Colors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <div className="h-24 bg-purple-700 rounded-lg"></div>
                  <p className="text-gray-600 font-paragraph mt-2">Primary Purple</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">bg-purple-700</code>
                  </div>
                </div>

                <div>
                  <div className="h-24 bg-[#d444ef87] rounded-lg"></div>
                  <p className="text-gray-600 font-paragraph mt-2">Semi-transparent Purple</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">bg-[#d444ef87]</code>
                  </div>
                </div>

                <div>
                  <div className="h-24 bg-purple-600 rounded-lg"></div>
                  <p className="text-gray-600 font-paragraph mt-2">Hover Purple</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">bg-purple-600</code>
                  </div>
                </div>

                <div>
                  <div className="h-24 bg-purple-50 rounded-lg border border-gray-100"></div>
                  <p className="text-gray-600 font-paragraph mt-2">Light Purple Background</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">bg-purple-50</code>
                  </div>
                </div>

                <div>
                  <div className="h-24 bg-white rounded-lg border border-gray-100"></div>
                  <p className="text-gray-600 font-paragraph mt-2">White</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">bg-white</code>
                  </div>
                </div>

                <div>
                  <div className="h-24 bg-gray-900 rounded-lg"></div>
                  <p className="text-gray-600 font-paragraph mt-2">Text Dark</p>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-100">
                    <code className="text-sm text-purple-600">text-gray-900</code>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Components Section */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Components</h2>
          
          {/* Buttons */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <h3 className="text-h3 mb-6 text-gray-900">Buttons</h3>
            <div className="space-y-8">
              <div>
                <PrimaryButton>
                  Primary Button
                </PrimaryButton>
                <p className="text-gray-600 font-paragraph mt-4">Main call-to-action button with hover effect and scale animation</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">import PrimaryButton from './ui/PrimaryButton';</code>
                  <br />
                  <code className="text-sm text-purple-600 mt-2">{`<PrimaryButton onClick={() => {}}>Button Text</PrimaryButton>`}</code>
                </div>
              </div>
              
              <div>
                <SecondaryButton>
                  Secondary Button
                </SecondaryButton>
                <p className="text-gray-600 font-paragraph mt-4">Alternative action button with border and hover effect</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">import SecondaryButton from './ui/SecondaryButton';</code>
                  <br />
                  <code className="text-sm text-purple-600 mt-2">{`<SecondaryButton onClick={() => {}}>Button Text</SecondaryButton>`}</code>
                </div>
              </div>
              
              <div>
                <TertiaryButton>
                  Tertiary Button
                </TertiaryButton>
                <p className="text-gray-600 font-paragraph mt-4">Subtle action button with semi-transparent background</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">import TertiaryButton from './ui/TertiaryButton';</code>
                  <br />
                  <code className="text-sm text-purple-600 mt-2">{`<TertiaryButton onClick={() => {}}>Button Text</TertiaryButton>`}</code>
                </div>
              </div>
              
              <div>
                <button className="text-gray-700 hover:text-purple-600 transition-colors">
                  <Search className="w-6 h-6" />
                </button>
                <p className="text-gray-600 font-paragraph mt-4">Icon button with hover effect</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="text-gray-700 hover:text-purple-600 transition-colors"</code>
                </div>
              </div>
            </div>
          </div>
          
          {/* Cards */}
          <div className="mb-12">
            <h3 className="text-h3 mb-6 text-gray-900">Cards</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {/* Feature Card */}
              <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-100">
                <div className="w-12 h-12 bg-purple-100 rounded-xl p-2 mb-4">
                  <LogIn className="w-8 h-8 text-purple-700" />
                </div>
                <h4 className="text-h4 mb-4 text-gray-900">Feature Card</h4>
                <p className="text-body font-paragraph text-gray-700">Used for highlighting features and key benefits</p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="bg-white p-6 rounded-xl shadow-lg border border-purple-100"</code>
                </div>
              </div>
              
              {/* Stat Card */}
              <div className="bg-white px-6 py-3 rounded-xl shadow-lg border border-purple-100 flex items-center gap-2">
                <div className="w-6 h-6 bg-purple-100 rounded-full"></div>
                <div className="w-px h-4 bg-gray-200"></div>
                <span className="text-gray-900 text-xl">Stat Card</span>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100 w-full">
                  <code className="text-sm text-purple-600">className="bg-white px-6 py-3 rounded-xl shadow-lg border border-purple-100 flex items-center gap-2"</code>
                </div>
              </div>
            </div>
          </div>
          
          {/* Navigation Components */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <h3 className="text-h3 mb-6 text-gray-900">Navigation</h3>
            
            {/* Top Navigation */}
            <div className="mb-8">
              <h4 className="text-h4 mb-4 text-gray-900">Top Navigation</h4>
              <div className="bg-white rounded-lg shadow-sm p-4">
                <p className="text-gray-600">See DashboardNavbar component in dashboard</p>
              </div>
            </div>
            
            {/* Search Bar */}
            <div className="mb-8">
              <h4 className="text-h4 mb-4 text-gray-900">Search Bar</h4>
              <div className="relative">
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">className="w-full px-4 py-2 pl-10 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:border-purple-400 transition-colors"</code>
              </div>
            </div>
          </div>
        </section>
        
        {/* Animations Section */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Animations & Hover Effects</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
            {/* Hover Effects */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-100">
              <h3 className="text-h3 mb-6 text-gray-900">Hover Effects</h3>
              
              <div className="bg-purple-100 p-4 rounded-lg text-center mb-4 hover:scale-105 transition-transform">
                Hover Scale
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">className="hover:scale-105 transition-transform"</code>
              </div>
            </div>
            
            {/* Transitions */}
            <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-100">
              <h3 className="text-h3 mb-6 text-gray-900">Transitions</h3>
              
              <div className="bg-purple-100 p-4 rounded-lg text-center transition-all hover:shadow-lg hover:-translate-y-1">
                Hover Lift & Shadow
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">className="transition-all hover:shadow-lg hover:-translate-y-1"</code>
              </div>
            </div>
          </div>
        </section>
        
        {/* Chart Colors Section */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Chart Colors</h2>
          
          <div className="bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
              <div>
                <div className="h-20 bg-[rgba(255,99,132,0.5)] rounded-lg mb-2"></div>
                <code className="text-sm text-purple-600">rgba(255,99,132,0.5)</code>
              </div>
              <div>
                <div className="h-20 bg-[rgba(54,162,235,0.5)] rounded-lg mb-2"></div>
                <code className="text-sm text-purple-600">rgba(54,162,235,0.5)</code>
              </div>
              <div>
                <div className="h-20 bg-[rgba(255,206,86,0.5)] rounded-lg mb-2"></div>
                <code className="text-sm text-purple-600">rgba(255,206,86,0.5)</code>
              </div>
              <div>
                <div className="h-20 bg-[rgba(75,192,192,0.5)] rounded-lg mb-2"></div>
                <code className="text-sm text-purple-600">rgba(75,192,192,0.5)</code>
              </div>
              <div>
                <div className="h-20 bg-[rgba(153,102,255,0.5)] rounded-lg mb-2"></div>
                <code className="text-sm text-purple-600">rgba(153,102,255,0.5)</code>
              </div>
            </div>
            <p className="text-gray-600 mt-4">Chart.js color palette used for data visualization</p>
          </div>
        </section>
        
        {/* Responsive Design Section */}
        <section className="mb-20">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-8 text-gray-900">Responsive Design</h2>
          
          {/* Breakpoints Info */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <h3 className="text-h3 mb-6 text-gray-900">Breakpoints</h3>
            <div className="space-y-4">
              <div>
                <p className="text-gray-900 font-semibold">Mobile: &lt; 768px</p>
                <code className="text-sm text-purple-600">sm: '640px'</code>
              </div>
              <div>
                <p className="text-gray-900 font-semibold">Tablet: 768px - 1023px</p>
                <code className="text-sm text-purple-600">md: '768px'</code>
              </div>
              <div>
                <p className="text-gray-900 font-semibold">Desktop: ≥ 1024px</p>
                <code className="text-sm text-purple-600">lg: '1024px'</code>
              </div>
            </div>
          </div>

          {/* Responsive Navigation */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <h3 className="text-h3 mb-6 text-gray-900">Navigation</h3>
            
            {/* Mobile Navigation */}
            <div className="mb-8">
              <h4 className="text-h4 mb-4 text-gray-900">Mobile Navigation</h4>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center justify-between mb-4 md:hidden">
                  <Menu className="w-6 h-6 text-gray-600" />
                  <img src="/logo.svg" alt="Logo" className="h-8" />
                  <User className="w-6 h-6 text-gray-600" />
                </div>
                <div className="p-4 bg-white rounded-lg md:hidden">
                  <div className="space-y-4">
                    <a href="#" className="block text-gray-900 hover:text-purple-600 transition-colors">Home</a>
                    <a href="#" className="block text-gray-900 hover:text-purple-600 transition-colors">Features</a>
                    <a href="#" className="block text-gray-900 hover:text-purple-600 transition-colors">Pricing</a>
                  </div>
                </div>
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">className="md:hidden"</code>
              </div>
            </div>

            {/* Tablet/Desktop Navigation */}
            <div>
              <h4 className="text-h4 mb-4 text-gray-900">Tablet/Desktop Navigation</h4>
              <div className="hidden md:flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                <img src="/logo.svg" alt="Logo" className="h-8" />
                <div className="flex items-center space-x-8">
                  <a href="#" className="text-gray-900 hover:text-purple-600 transition-colors">Home</a>
                  <a href="#" className="text-gray-900 hover:text-purple-600 transition-colors">Features</a>
                  <a href="#" className="text-gray-900 hover:text-purple-600 transition-colors">Pricing</a>
                </div>
                <User className="w-6 h-6 text-gray-600" />
              </div>
              <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <code className="text-sm text-purple-600">className="hidden md:flex"</code>
              </div>
            </div>
          </div>

          {/* Responsive Grid Layouts */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <h3 className="text-h3 mb-6 text-gray-900">Grid Layouts</h3>
            
            <div className="space-y-8">
              {/* Mobile Grid */}
              <div>
                <h4 className="text-h4 mb-4 text-gray-900">Mobile (1 Column)</h4>
                <div className="grid grid-cols-1 gap-4">
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 1</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 2</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 3</div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="grid grid-cols-1 gap-4"</code>
                </div>
              </div>

              {/* Tablet Grid */}
              <div>
                <h4 className="text-h4 mb-4 text-gray-900">Tablet (2 Columns)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 1</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 2</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 3</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 4</div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="grid grid-cols-1 md:grid-cols-2 gap-4"</code>
                </div>
              </div>

              {/* Desktop Grid */}
              <div>
                <h4 className="text-h4 mb-4 text-gray-900">Desktop (3 Columns)</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 1</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 2</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 3</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 4</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 5</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 6</div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"</code>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Text */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <h3 className="text-h3 mb-6 text-gray-900">Responsive Typography</h3>
            
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl md:text-6xl text-gray-900 mb-4">Responsive Header</h1>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="text-4xl sm:text-5xl md:text-6xl"</code>
                </div>
              </div>

              <div>
                <p className="text-base sm:text-lg md:text-xl text-gray-700">
                  Responsive paragraph text that scales up on larger screens for better readability.
                </p>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="text-base sm:text-lg md:text-xl"</code>
                </div>
              </div>
            </div>
          </div>

          {/* Responsive Spacing */}
          <div className="mb-12 bg-white p-8 rounded-xl shadow-lg border border-purple-100">
            <h3 className="text-h3 mb-6 text-gray-900">Responsive Spacing</h3>
            
            <div className="space-y-8">
              <div>
                <div className="p-4 sm:p-6 md:p-8 bg-purple-100 rounded-lg text-center">
                  Responsive Padding
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="p-4 sm:p-6 md:p-8"</code>
                </div>
              </div>

              <div>
                <div className="space-y-4 sm:space-y-6 md:space-y-8">
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 1</div>
                  <div className="bg-purple-100 p-4 rounded-lg text-center">Item 2</div>
                </div>
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                  <code className="text-sm text-purple-600">className="space-y-4 sm:space-y-6 md:space-y-8"</code>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default StyleGuide;
