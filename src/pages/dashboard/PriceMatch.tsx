import React from 'react';
import { PageTemplate } from '../../components/common/PageTemplate';
import { ContentContainer } from '../../components/common/ContentContainer';
import { Button } from '../../components/common/Button';

export const PriceMatch = () => {
  return (
    <PageTemplate
      title="Price Match"
      description="Compare your receipt items with current market prices to find the best deals and save money on your purchases."
      actionButton={
        <Button variant="primary" onClick={() => {}}>
          Compare Prices
        </Button>
      }
    >
      <ContentContainer
        title="Recent Items"
        description="Select items from your recent receipts to compare prices"
      >
        {/* Add your price match components here */}
      </ContentContainer>

      <ContentContainer
        title="Price Comparison"
        description="View price differences across different stores"
        className="mt-6"
      >
        {/* Add price comparison results here */}
      </ContentContainer>
    </PageTemplate>
  );
};
