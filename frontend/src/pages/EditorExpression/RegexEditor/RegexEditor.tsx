import Form from 'react-bootstrap/Form';
import { useExpressionStore } from '/src/stores';
import { Wrapper } from './regexEditorStyle';
import useExpressionsStore from '/src/stores/useExpressionsStore';

const RegexEditor = () => {

    const currentExpression = useExpressionStore(s => s.expression)
    const updateExpression = useExpressionStore(s => s.update)
    const upsertExpression = useExpressionsStore(s => s.upsertExpression)
    const commit = useExpressionStore(s => s.commit)

    const updateRegex = (newExpression) => {
        updateExpression({...currentExpression, expression: newExpression})
        upsertExpression({...currentExpression, expression: newExpression})
        commit()
    
    }

    return (
        <>
        <Wrapper>
            <Form onSubmit={(e) => e.preventDefault()}>
                <Form.Label>Regular Expression</Form.Label>
                <Form.Control
                    type="text"
                    placeholder="Write your regular expression"
                    defaultValue={currentExpression.expression}
                    onChange={(e) => updateRegex(e.target.value)}
                />
            </Form>
        </Wrapper>
        </>
    );
};

export default RegexEditor;