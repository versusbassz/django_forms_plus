/**
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/File_API}
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/FileList}
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/File}
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/Blob}
 *
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/URL/createObjectURL}
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/URL/revokeObjectURL}
 *
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/DataTransfer}
 *
 * @see {https://developer.mozilla.org/en-US/docs/Web/HTML/Attributes/accept}
 */

import React, { useEffect, useRef, useState, BaseSyntheticEvent, JSX } from "react";
import ReactCrop, { Crop, PercentCrop } from "react-image-crop";
import ModalUnstyled from "@mui/base/ModalUnstyled";

import { useFieldSpec } from "../inc/hooks";
import { useFormContext } from "../inc/context";
import { useFieldAttrs } from "./fields";
import classNames from "classnames";
import { FieldSpec } from "../types";


type PreviewDebugInfo = {
  width: number,
  height: number,
  size: number,
};

const initialCrop: Crop = {unit: 'px', x: 0, y: 0, width: 50, height: 50};

export function ImageUpload({name}: {name: string}): JSX.Element {
  const [rhf, rhf_options, other_attrs] = useFieldAttrs(name);
  const [field_spec, _] = useFieldSpec(name);

  const ratio = field_spec.expected_width / field_spec.expected_height;

  const validateField = async () => await rhf.trigger(name, { shouldFocus: false });

  const value = rhf_options.value;
  const hasImage = rhf_options.value?.exists;
  rhf_options.value = '';

  const inputRef = useRef(null);

  const [inputValue, setInputValue] = useState(null);

  // fetch valid MIME types
  const [validTypes, setValidTypes] = useState(null);
  useEffect(() => {
    field_spec.validators.forEach(item => {
      if (item.name === 'file_type') {
        setValidTypes(item.value);
      }
    });
  }, []);

  useEffect(() => {
    if (inputValue) {
      rhf.setValue(name, inputValue, {shouldValidate: true});
      // validateField();
    }
  }, [inputValue]);

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewSrc, setPreviewSrc] = useState('');
  const [previewDebugInfo, setPreviewDebugInfo] = useState<PreviewDebugInfo>({} as PreviewDebugInfo);

  const onPreviewLoad = (e: BaseSyntheticEvent): void => {
    const target = e.target;
    const data: PreviewDebugInfo = {
      width: target.naturalWidth,
      height: target.naturalHeight,
      size: target.size,
    }
    setPreviewDebugInfo(data);
  }

  const { submitResult, debugEnabled } = useFormContext();
  const submitFieldValue = submitResult && submitResult[name] ? submitResult[name] : null;

  // dont display the button for now
  const [showCropChangeButton, setShowCropChangeButton] = useState(false);

  const [crop, setCrop] = useState<Crop>(initialCrop);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showCropCancelButton, setShowCropCancelButton] = useState(false);

  // setSelectedFile onChange input:file
  const inputOnChange = (e: BaseSyntheticEvent): void => {
    console.log('input onChange', e);
    if (! e.target.files || e.target.files.length === 0) {
        setSelectedFile(null);
        return;
    }

    const file = e.target.files[0];
    setInputValue(e.target.files);
    console.log('file', file);

    if (! validTypes.length || validTypes.includes(file.type)) {
      setSelectedFile(file);
      setCrop(initialCrop);
      setShowCropModal(true);
    }
  };

  // set preview on mount from the initial form state
  useEffect(() => {
    hasImage && setPreviewSrc(value.url);
  }, []);

  // set preview onChange input:file
  // see: https://stackoverflow.com/a/57781164
  useEffect(() => {
    if (! selectedFile) {
      const initial_url = hasImage ? value.url : undefined;
      setPreviewSrc(submitFieldValue ? submitFieldValue?.url : initial_url);
      return;
    }

    const objectUrl = isBlobUrl(selectedFile) ? selectedFile : URL.createObjectURL(selectedFile);
    setPreviewSrc(objectUrl);

    // free memory when ever this component is unmounted
    return () => URL.revokeObjectURL(objectUrl);
  }, [selectedFile]);

  // validate file on input change
  useEffect(() => {
    if (selectedFile) validateField();
  }, [selectedFile]);

  // set preview on form submission success result
  useEffect(() => {
    if (submitFieldValue) {
      const field = submitResult[name];
      setPreviewSrc(field.exists ? field.url : '');

      setSelectedFile(null);
      inputRef.current.value = '';
      setInputValue(null);

      setCrop(initialCrop);
    }
  }, [submitResult]);

  const editButtonOnClick = () => setShowCropModal(true);

  const confirmCrop = () => {
    console.log('CROP - CONFIRM', crop, typeof inputRef.current, inputRef.current);

    setShowCropModal(false);
    // setShowCropCancelButton(true);
    setCrop(initialCrop);

    const img = new Image();
    img.src = previewSrc;
    img.onload = async () => {
      const blob = await getCroppedImg(img, crop as PercentCrop, field_spec); // TODO dirty, type "crop" as PercentCrop only
      URL.revokeObjectURL(selectedFile);

      const newUrl = URL.createObjectURL(blob);
      setSelectedFile(newUrl);

      let file = new File(
        [blob],
        'edited.jpg', // should .replace(/[/\\?%*:|"<>]/g, '-') for remove special char like / \
        {
          type: 'image/jpeg',
          lastModified: new Date().getTime(),
        },
      );
      let container = new DataTransfer();
      container.items.add(file);

      inputRef.current.files = container.files;

      setInputValue(container.files);
    };
  };

  const cancelCrop = () => {
    console.log('CROP - CANCEL');
    setShowCropModal(false);
  };

  // const _inputAttrs = rhf.register(name, {...rhf_options, onChange: inputOnChange});
  function setInputRef (elem: HTMLElement): void {
     // see: https://react-hook-form.com/faqs#Howtosharerefusage
     // ref(elem);
     inputRef.current = elem;
  }

  const {className, ...other_attrs_rest} = other_attrs;
  const inputCssClasses = classNames(['dfp-input-file__input', ...(className ? className : [])])

  return (
    <>
      {/* Preview */}
      {previewSrc ? (
        <div className="dfp-input-file__preview">
          <img src={previewSrc} alt="" className="dfp-input-file__preview-picture" onLoad={onPreviewLoad} />
        </div>
      ) : null}  {/*<div className="dfp-input-file__preview-placeholder" />*/}

      {/* "Clear" checkbox */}
      {previewSrc && ! selectedFile ? (
        <div className="dfp-input-file__clear-wrapper form-check">
          <input type="checkbox"
                 id={field_spec.checkbox_id}
                 name={field_spec.checkbox_name}
          />
          <label htmlFor={field_spec.checkbox_id}>Удалить</label>
        </div>
      ): null}

      {/* "Edit" button */}
      {showCropChangeButton ? (
        <div className="dfp-input-file__edit-wrapper">
          <button type="button" onClick={editButtonOnClick}>Изменить</button>
        </div>
      ) : null}

      {/* Input */}
      <div className="dfp-input-file__input-wrapper">
        <input
          {...other_attrs_rest}
          className={inputCssClasses}
          name={name}
          type="file"
          ref={setInputRef}
          onChange={inputOnChange}
        />
      </div>

      {debugEnabled && previewSrc && previewDebugInfo ? (
        <div style={{margin:'20px 0'}}>
            <div>{JSON.stringify(previewDebugInfo)}</div>
        </div>
      ) : null}

      {/* "Crop" window */}
      <ModalUnstyled open={showCropModal}>
        <div className="dfp-crop">
          <div className="dfp-crop__wrapper">
            <ReactCrop
              crop={crop}
              aspect={ratio}
              minWidth={100}
              minHeight={100}
              onChange={(crop, percentCrop) => setCrop(percentCrop)}
            >
              <img src={previewSrc} />
            </ReactCrop>
          </div>
          <div className="dfp-crop__buttons">
            {showCropCancelButton && (
              <button
                type="button"
                className="dfp-crop__button"
                onClick={cancelCrop}
              >Отменить</button>
            )}
            <button type="button" className="dfp-crop__button" onClick={confirmCrop}>Применить</button>
          </div>

        </div>
      </ModalUnstyled>

    </>
  );
}

/**
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D}
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage}
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/setTransform}
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/imageSmoothingQuality}
 *
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio}
 *
 * @see {https://developer.mozilla.org/en-US/docs/Web/API/HTMLImageElement/Image}
 */
function getCroppedImg(image: HTMLImageElement, crop: PercentCrop, field_spec: FieldSpec): Promise<Blob> {
  const { expected_width, expected_height } = field_spec;

  const nat_w = image.naturalWidth;
  const nat_h = image.naturalHeight;
  const pixelRatio = window.devicePixelRatio;

  const sWidth = Math.floor((crop.width / 100) * nat_w * pixelRatio);
  const sHeight = Math.floor((crop.height / 100) * nat_h * pixelRatio);
  const sx = Math.floor(nat_w * (crop.x / 100));
  const sy = Math.floor(nat_h * (crop.y / 100));
  const dx = 0;
  const dy = 0;
  const dWidth = expected_width;
  const dHeight= expected_height;

  const quality = getQualityValue(expected_width, expected_height);

  const canvas = document.createElement('canvas');
  canvas.width = expected_width;
  canvas.height = expected_height;

  const ctx = canvas.getContext('2d');
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(
    image,
    sx, sy,
    sWidth, sHeight,
    dx, dy,
    dWidth, dHeight,
  );

  return new Promise((resolve, reject) => {
    const handleBlob = (blob: Blob | null): void => { // interface BlobCallback
        if (! blob) {
          console.error('Canvas is empty');
          reject(new Error('Canvas is empty'));
          return;
        }

        resolve(blob);
      };

    canvas.toBlob(handleBlob, 'image/jpeg', quality);
  });
}

function getQualityValue(width: number, height: number): number {
  const target_val = width > height ? width : height;

  if (target_val < 500) return 0.6;
  if (target_val < 1000) return 0.4;
  if (target_val < 2000) return 0.25;
  return 0.15;
}

// TODO maybe add a special type BlobURL and make this function as typeguard?
function isBlobUrl(value: any): boolean {
  return typeof value === 'string' && value.startsWith('blob');
}
