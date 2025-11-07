import React from 'react';
import { PageTemplate } from '../../components/template/PageTemplate';
import { ContentContainer } from '../../components/template/ContentContainer';
import { Button } from '../../components/template/Button';

export const TemplatePreview = () => {
  return (
    <PageTemplate
      title="Template Structure"
      description="This shows the layout structure of our page template. Each section is outlined to show the template areas."
    >
      {/* Template Area Description */}
      <ContentContainer className="border-2 border-dashed border-purple-500/30">
        <div className="space-y-4">
          <div className="border-2 border-dashed border-pink-500/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Header Area</h3>
            <p className="text-white/70">Contains:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>Main title (large, bold)</li>
              <li>Description text (lighter color)</li>
              <li>Optional action button</li>
            </ul>
          </div>

          <div className="border-2 border-dashed border-pink-500/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Content Area</h3>
            <p className="text-white/70">Features:</p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>Backdrop blur effect</li>
              <li>Subtle white background</li>
              <li>Rounded corners</li>
              <li>Consistent padding</li>
            </ul>
          </div>
        </div>
      </ContentContainer>

      {/* Example Usage */}
      <ContentContainer 
        title="Example Section"
        description="This shows how a section with header looks"
        className="mt-6 border-2 border-dashed border-purple-500/30"
        headerContent={
          <Button size="sm" variant="secondary">
            Section Action
          </Button>
        }
      >
        <div className="space-y-4">
          <div className="border-2 border-dashed border-pink-500/30 p-4 rounded-lg">
            <h3 className="text-lg font-semibold text-white mb-2">Section Content</h3>
            <p className="text-white/70">
              This is an example of content within a section. The section includes:
            </p>
            <ul className="list-disc list-inside text-white/70 space-y-1">
              <li>Section title</li>
              <li>Optional description</li>
              <li>Optional header content (like buttons)</li>
              <li>Main content area</li>
            </ul>
          </div>
        </div>
      </ContentContainer>
    </PageTemplate>
  );
};
