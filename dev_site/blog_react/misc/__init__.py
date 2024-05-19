from django_forms_plus import get_form_spec


class AddFormDebugForViewMixin:
    # debug
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)

        form = context['form']
        spec = get_form_spec(form)

        context['form_state'] = spec
        context['form_state_raw'] = spec.model_dump_json()
        context['form_state_formatted'] = spec.model_dump_json(indent=4)

        if not hasattr(self, 'x_page_title'):
            raise ValueError('set "x_page_title" attr for the view. It is required by AddFormDebugForViewMixin')
        context['title'] = self.x_page_title

        return context
