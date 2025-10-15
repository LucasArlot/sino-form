import { QuoteForm } from '@/features/lead';
import { QuoteFormProvider } from '@/features/lead/QuoteFormContext';
import '@/styles/main.css';

function EmbedApp() {
  return (
    <QuoteFormProvider>
      <QuoteForm />
    </QuoteFormProvider>
  );
}

export default EmbedApp;
