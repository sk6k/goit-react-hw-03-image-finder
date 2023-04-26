import React, { Component } from 'react';
import Searchbar from './Searchbar/Searchbar';
import { fetchImages } from 'api/images';
import { ImageGallery } from './ImageGallery/ImageGallery';
import { Button } from './Button/Button';
import { Loader } from './Loader/Loader';
import { Modal } from './Modal/Modal';
import { ErrorMessage } from './ErrorMessage/ErrorMessage';

class App extends Component {
  state = {
    searchQuery: '',
    images: [],
    page: 1,
    error: null,
    showLoader: false,
    showModal: false,
    modalImageURL: null,
    showErrorMessage: false,
  };

  componentDidUpdate(prevProps, prevState) {
    const prevSearchQuery = prevState.searchQuery;
    const nextSearchQuery = this.state.searchQuery;

    const prevPage = prevState.page;
    const nextPage = this.state.page;

    if (prevSearchQuery !== nextSearchQuery || prevPage !== nextPage) {
      this.getImages(nextSearchQuery, this.state.page);
    }
  }

  getImages(searchQuery, page) {
    this.setState({ showLoader: true, showErrorMessage: false });
    fetchImages(searchQuery, page)
      .then(searchData => {
        if (searchData.totalHits === 0) {
          this.setState({ showErrorMessage: true });
        }
        searchData.hits.map(({ id, webformatURL, largeImageURL, tags }) =>
          this.setState(prevState => ({
            images: [
              ...prevState.images,
              { id, webformatURL, largeImageURL, tags },
            ],
          }))
        );
      })
      .catch(error => this.setState({ error }))
      .finally(() => {
        this.setState({
          showLoader: false,
        });
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth',
        });
      });
  }

  handleFormSubmit = searchQuery => {
    this.setState({
      searchQuery: searchQuery,
      images: [],
      page: 1,
      showErrorMessage: false,
    });
  };

  toggleModal = () => {
    this.setState(({ showModal }) => ({
      showModal: !showModal,
    }));
  };

  loadMore = () => {
    this.setState(prevState => ({
      page: prevState.page + 1,
    }));
  };

  onImageClick = (largeImageURL, tags) => {
    this.setState({
      modalImageURL: { largeImageURL: largeImageURL, tags: tags },
    });
    this.toggleModal();
  };

  render() {
    const { images, showModal, showLoader, showErrorMessage } = this.state;

    return (
      <>
        <Searchbar onSubmit={this.handleFormSubmit} />
        {showErrorMessage && (
          <ErrorMessage searchQuery={this.state.searchQuery} />
        )}

        {images.length !== 0 && (
          <ImageGallery
            images={this.state.images}
            onImageClick={this.onImageClick}
          />
        )}

        {showLoader && <Loader />}

        {images.length > 0 && !showLoader && (
          <Button loadMore={this.loadMore} />
        )}

        {showModal && (
          <Modal
            onClose={this.toggleModal}
            modalImageURL={this.state.modalImageURL}
          />
        )}
      </>
    );
  }
}

export default App;
