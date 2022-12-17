import React from "react";
import classNames from "classnames";

const MESSAGE_TYPE__SUCCESS = 'success';
const MESSAGE_TYPE__ERROR = 'error';

export function SuccessMessage({close, content = ''}) {
  if (! content) content = 'Форма успешно отправлена!';
  return (
    <GenericMessage type={MESSAGE_TYPE__SUCCESS} content={content} close={close} />
  )
}

export function ErrorMessage({content = ''}) {
  if (! content) content = 'Произошла ошибка';
  return (
    <GenericMessage type={MESSAGE_TYPE__ERROR} content={content} />
  )
}

export function GenericMessage({type, content, children, close}) {
  const has_close_action = !! close;
  const onCloseClick = () => close && close();
  return (
    <div className={classNames(['dfp-message', `dfp-message--${type}`])}>
      {content && (
        <div className="dfp-message__content" dangerouslySetInnerHTML={{__html: content}} />
      )}
      {children && <div className="dfp-message__content">{children}</div>}

      {has_close_action && (
        <div className="dfp-message__close-wrapper">
          <button type="button"
             className="dfp-message__close"
             onClick={onCloseClick}
          >Закрыть</button>
        </div>
      )}
    </div>
  );
}
