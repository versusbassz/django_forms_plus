from django_forms_plus import get_form_spec


class AddFormDebugForViewMixin:
    # debug
    def get_context_data(self, *args, **kwargs):
        context = super().get_context_data(*args, **kwargs)

        form = context['form']
        context['form_state'] = get_form_spec(form)
        context['form_state_formatted'] = get_form_spec(form).json(indent=4)
        context['title'] = self.x_page_title
        return context
