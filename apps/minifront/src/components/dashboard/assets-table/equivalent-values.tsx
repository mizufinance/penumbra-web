import { ValueView } from '@mizufinance/protobuf/shieldd/core/asset/v1/asset_pb';
import { asValueView } from '@mizufinance/getters/equivalent-value';
import { getDisplayDenomFromView, getEquivalentValues } from '@mizufinance/getters/value-view';
import { ValueViewComponent } from '@mizufinance/ui-deprecated/components/ui/value';

export const EquivalentValues = ({ valueView }: { valueView?: ValueView }) => {
  const equivalentValuesAsValueViews = (getEquivalentValues.optional(valueView) ?? []).map(
    asValueView,
  );

  return (
    <div className='flex flex-wrap gap-2'>
      {equivalentValuesAsValueViews.map(equivalentValueAsValueView => (
        <ValueViewComponent
          key={getDisplayDenomFromView(equivalentValueAsValueView)}
          view={equivalentValueAsValueView}
          variant='equivalent'
        />
      ))}
    </div>
  );
};
