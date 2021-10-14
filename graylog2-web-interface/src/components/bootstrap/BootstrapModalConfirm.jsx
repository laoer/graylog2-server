/*
 * Copyright (C) 2020 Graylog, Inc.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the Server Side Public License, version 1,
 * as published by MongoDB, Inc.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * Server Side Public License for more details.
 *
 * You should have received a copy of the Server Side Public License
 * along with this program. If not, see
 * <http://www.mongodb.com/licensing/server-side-public-license>.
 */
import React, { useRef } from 'react';
import PropTypes from 'prop-types';

import Modal from './Modal';
import BootstrapModalWrapper from './BootstrapModalWrapper';
import Button from './Button';

/**
 * Component that displays a confirmation dialog box that the user can
 * cancel or confirm.
 */
const BootstrapModalConfirm = ({
  showModal,
  onModalOpen,
  onModalClose,
  onCancel,
  onConfirm,
  title,
  children,
  cancelButtonDisabled,
  confirmButtonDisabled,
  cancelButtonText,
  confirmButtonText,
}) => {
  const modalRef = useRef();

  const close = () => {
    modalRef.current.close();
  };

  const handleCancel = () => {
    onCancel();

    close();
  };

  const handleConfirm = () => {
    onConfirm(close);
  };

  return (
    <BootstrapModalWrapper ref={modalRef}
                           showModal={showModal}
                           onOpen={onModalOpen}
                           onClose={onModalClose}
                           onHide={handleCancel}
                           role="alertdialog">
      <Modal.Header closeButton>
        <Modal.Title>{title}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {children}
      </Modal.Body>

      <Modal.Footer>
        <Button type="button" onClick={onCancel} disabled={cancelButtonDisabled}>{cancelButtonText}</Button>
        <Button type="button" onClick={handleConfirm} bsStyle="primary" disabled={confirmButtonDisabled}>{confirmButtonText}</Button>
      </Modal.Footer>
    </BootstrapModalWrapper>
  );
};

BootstrapModalConfirm.propTypes = {
  /** Indicates whether the modal should be shown by default or not. */
  showModal: PropTypes.bool,
  /** Title to use in the modal. */
  title: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
  /** Text to use in the cancel button. */
  cancelButtonText: PropTypes.string,
  /** Text to use in the confirmation button. */
  confirmButtonText: PropTypes.string,
  /** Indicates whether the cancel button should be disabled or not. */
  cancelButtonDisabled: PropTypes.bool,
  /** Indicates whether the confirm button should be disabled or not. */
  confirmButtonDisabled: PropTypes.bool,
  /** Function to call when the modal is opened. The function does not receive any arguments. */
  onModalOpen: PropTypes.func,
  /** Function to call when the modal is closed. The function does not receive any arguments. */
  onModalClose: PropTypes.func,
  /** Function to call when the action is not confirmed. The function does not receive any arguments. */
  onCancel: PropTypes.func,
  /**
   * Function to call when the action is confirmed. The function receives a callback function to close the modal
   * dialog box as first argument.
   */
  onConfirm: PropTypes.func.isRequired,
  /**
   * React elements to display in the modal body. This should be the information the user has
   * to confirm in order to proceed with the operation.
   */
  children: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.element,
  ]).isRequired,
};

BootstrapModalConfirm.defaultProps = {
  showModal: false,
  cancelButtonText: 'Cancel',
  confirmButtonText: 'Confirm',
  cancelButtonDisabled: false,
  confirmButtonDisabled: false,
  onCancel: () => {},
  onModalOpen: () => {},
  onModalClose: () => {},
};

export default BootstrapModalConfirm;
