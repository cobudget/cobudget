import { useMutation, gql } from "urql";
import { SortableElement, SortableHandle } from "react-sortable-hoc";
import { DraggableIcon } from "components/Icons";
import { Tooltip } from "react-tippy";
import IconButton from "components/IconButton";
import { DeleteIcon, EditIcon } from "components/Icons";
import DraggableItems from "../DraggableItems";
import Markdown from "components/Markdown";
import { FormattedMessage, useIntl, } from "react-intl";

const DELETE_GUIDELINE_MUTATION = gql`
  mutation DeleteGuideline($roundId: ID!, $guidelineId: ID!) {
    deleteGuideline(roundId: $roundId, guidelineId: $guidelineId) {
      id
      guidelines {
        id
        title
        description
      }
    }
  }
`;

const SET_GUIDELINE_POSITION_MUTATION = gql`
  mutation SetGuidelinePosition(
    $roundId: ID!
    $guidelineId: ID!
    $newPosition: Float
  ) {
    setGuidelinePosition(
      roundId: $roundId
      guidelineId: $guidelineId
      newPosition: $newPosition
    ) {
      id
      guidelines {
        id
        title
        description
        position
      }
    }
  }
`;

const DragHandle = SortableHandle(() => (
  <IconButton className="mx-1 cursor-move">
    <DraggableIcon className="h-6 w-6" />
  </IconButton>
));

const SortableItem = SortableElement(
  ({ item: guideline, setEditingItem: setEditingGuideline, roundId }) => {
    const [{ fetching: deleting }, deleteGuideline] = useMutation(
      DELETE_GUIDELINE_MUTATION
    );

    const intl = useIntl();

    return (
      <li className="group bg-white p-4 mb-3 rounded shadow list-none">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-lg">{guideline.title}</h2>
          <div>
            <Tooltip title={intl.formatMessage({ defaultMessage: "Edit" })} position="bottom" size="small">
              <IconButton
                onClick={() => setEditingGuideline(guideline)}
                className="mx-1"
              >
                <EditIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete" position="bottom" size="small">
              <IconButton
                loading={deleting}
                onClick={() =>
                  confirm(
                    intl.formatMessage({ defaultMessage:"Are you sure you would like to delete this guideline?" })
                  ) &&
                  deleteGuideline({
                    roundId,
                    guidelineId: guideline.id,
                  })
                }
              >
                <DeleteIcon className="h-6 w-6" />
              </IconButton>
            </Tooltip>

            <Tooltip title={intl.formatMessage({ defaultMessage:"Drag to reorder" })} position="bottom" size="small">
              <DragHandle />
            </Tooltip>
          </div>
        </div>
        <Markdown source={guideline.description} />
      </li>
    );
  }
);

const DraggableGuidelines = ({ round, items, setEditingItem }) => {
  const [{ fetching: loading }, setGuidelinePosition] = useMutation(
    SET_GUIDELINE_POSITION_MUTATION
  );
  const setItemPosition = (guidelineId, newPosition) => {
    setGuidelinePosition({
      roundId: round.id,
      guidelineId,
      newPosition,
    });
  };

  return (
    <DraggableItems
      round={round}
      items={items}
      setItemPosition={setItemPosition}
      setPositionLoading={loading}
      SortableItem={SortableItem}
      setEditingItem={setEditingItem}
    />
  );
};

export default DraggableGuidelines;
