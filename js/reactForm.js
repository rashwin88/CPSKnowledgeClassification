// React form component for adding staging entries
(function () {
    const { useState, useEffect } = React;

    function FormField({ label, name, value, onChange, type = 'text', readOnly = false, required = false }) {
        return React.createElement('div', { className: 'form-group' }, [
            React.createElement('label', { key: 'label' }, label + (required ? ' *' : '')),
            type === 'textarea'
                ? React.createElement('textarea', { key: 'input', name, value, onChange, readOnly, required })
                : React.createElement('input', { key: 'input', type, name, value, onChange, readOnly, required })
        ]);
    }

    function CardForm({ classificationNumber, onClose }) {
        const [formData, setFormData] = useState({
            subject: '',
            item_number: '',
            title: '',
            subtitle: '',
            title_with_author: '',
            title_indian_language: '',
            subtitle_indian_language: '',
            main_author: '',
            second_author: '',
            third_author: '',
            statement_of_responsibility: '',
            edition: '',
            publisher: '',
            year_of_publication: '',
            pages: '',
            volume: '',
            language: '',
            language_note: '',
            general_note: '',
            toc: '',
            accession_number: '',
            series_note: '',
            cataloguer: '',
            libraries: ''
        });
        const [submitting, setSubmitting] = useState(false);

        // Update subject when the classification changes
        useEffect(() => {
            let cancelled = false;
            async function updateSubject() {
                const cleaned = classificationNumber.replace(/#.*?#/, '');
                const raw = window.getClassificationPath
                    ? await window.getClassificationPath(cleaned)
                    : cleaned;
                const subject = raw.replace(/-/g, ' ');
                if (!cancelled) {
                    setFormData(prev => ({ ...prev, subject }));
                }
            }
            updateSubject();
            return () => { cancelled = true; };
        }, [classificationNumber]);

        const handleChange = (e) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            if (!formData.item_number) {
                alert('Item Number is required');
                return;
            }
            setSubmitting(true);
            const id = (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).substring(2, 15));
            const payload = {
                id,
                classification_number: classificationNumber,
                item_number: formData.item_number,
                subject: formData.subject || null,
                title: formData.title || null,
                subtitle: formData.subtitle || null,
                title_with_author: formData.title_with_author || null,
                title_indian_language: formData.title_indian_language || null,
                subtitle_indian_language: formData.subtitle_indian_language || null,
                main_author: formData.main_author || null,
                second_author: formData.second_author || null,
                third_author: formData.third_author || null,
                statement_of_responsibility: formData.statement_of_responsibility || null,
                edition: formData.edition || null,
                publisher: formData.publisher || null,
                year_of_publication: formData.year_of_publication ? parseInt(formData.year_of_publication, 10) : null,
                pages: formData.pages ? parseInt(formData.pages, 10) : null,
                volume: formData.volume || null,
                language: formData.language || null,
                language_note: formData.language_note || null,
                general_note: formData.general_note || null,
                toc: formData.toc || null,
                accession_number: formData.accession_number || null,
                series_note: formData.series_note || null,
                cataloguer: formData.cataloguer || null,
                libraries: formData.libraries || null,
                status: 'pending'
            };
            try {
                const { error } = await supabase.from('staging_entries').insert(payload);
                if (error) {
                    console.error('Error inserting:', error);
                    alert('Error submitting form');
                } else {
                    alert('Entry submitted successfully');
                    if (onClose) onClose();
                }
            } catch (err) {
                console.error(err);
                alert('Error submitting form');
            }
            setSubmitting(false);
        };

        return React.createElement('form', { className: 'react-form', onSubmit: handleSubmit }, [
            React.createElement('div', { className: 'form-fields' }, [
                FormField({ label: 'Classification Number', name: 'classification_number', value: classificationNumber, onChange: () => {}, readOnly: true }),
                FormField({ label: 'Item Number', name: 'item_number', value: formData.item_number, onChange: handleChange, required: true }),
                FormField({ label: 'Subject', name: 'subject', value: formData.subject, onChange: () => {}, readOnly: true }),
                FormField({ label: 'Title', name: 'title', value: formData.title, onChange: handleChange }),
                FormField({ label: 'Subtitle', name: 'subtitle', value: formData.subtitle, onChange: handleChange }),
                FormField({ label: 'Title With Author', name: 'title_with_author', value: formData.title_with_author, onChange: handleChange }),
                FormField({ label: 'Title Indian Language', name: 'title_indian_language', value: formData.title_indian_language, onChange: handleChange }),
                FormField({ label: 'Subtitle Indian Language', name: 'subtitle_indian_language', value: formData.subtitle_indian_language, onChange: handleChange }),
                FormField({ label: 'Main Author', name: 'main_author', value: formData.main_author, onChange: handleChange }),
                FormField({ label: 'Second Author', name: 'second_author', value: formData.second_author, onChange: handleChange }),
                FormField({ label: 'Third Author', name: 'third_author', value: formData.third_author, onChange: handleChange }),
                FormField({ label: 'Statement Of Responsibility', name: 'statement_of_responsibility', value: formData.statement_of_responsibility, onChange: handleChange }),
                FormField({ label: 'Edition', name: 'edition', value: formData.edition, onChange: handleChange }),
                FormField({ label: 'Publisher', name: 'publisher', value: formData.publisher, onChange: handleChange }),
                FormField({ label: 'Year Of Publication', name: 'year_of_publication', value: formData.year_of_publication, onChange: handleChange, type: 'number' }),
                FormField({ label: 'Pages', name: 'pages', value: formData.pages, onChange: handleChange, type: 'number' }),
                FormField({ label: 'Volume', name: 'volume', value: formData.volume, onChange: handleChange }),
                FormField({ label: 'Language', name: 'language', value: formData.language, onChange: handleChange }),
                FormField({ label: 'Language Note', name: 'language_note', value: formData.language_note, onChange: handleChange }),
                FormField({ label: 'General Note', name: 'general_note', value: formData.general_note, onChange: handleChange }),
                FormField({ label: 'Toc', name: 'toc', value: formData.toc, onChange: handleChange, type: 'textarea' }),
                FormField({ label: 'Accession Number', name: 'accession_number', value: formData.accession_number, onChange: handleChange }),
                FormField({ label: 'Series Note', name: 'series_note', value: formData.series_note, onChange: handleChange }),
                FormField({ label: 'Cataloguer', name: 'cataloguer', value: formData.cataloguer, onChange: handleChange }),
                FormField({ label: 'Libraries', name: 'libraries', value: formData.libraries, onChange: handleChange })
            ]),
            React.createElement('div', { className: 'form-actions' }, [
                React.createElement('button', { type: 'submit', disabled: submitting }, submitting ? 'Submitting...' : 'Submit')
            ])
        ]);
    }

    const root = ReactDOM.createRoot(document.getElementById('reactFormRoot'));

    window.renderForm = function (classificationNumber) {
        root.render(React.createElement(CardForm, {
            classificationNumber,
            onClose: window.closeFormModal
        }));
    };
})();
