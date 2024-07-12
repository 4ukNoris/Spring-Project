package bg.softuni.mycinematicketsapp.models.dtos;

import bg.softuni.mycinematicketsapp.models.enums.Genre;
import bg.softuni.mycinematicketsapp.models.enums.HallNumber;
import bg.softuni.mycinematicketsapp.models.enums.MovieClassEnum;
import bg.softuni.mycinematicketsapp.models.enums.ProjectionFormat;
import bg.softuni.mycinematicketsapp.validation.annotation.UniqueMovieName;
import jakarta.validation.constraints.*;

import java.util.ArrayList;
import java.util.List;

public class CreateMovieDto {

    @NotEmpty(message = "Name cannot be null ot empty!")
    @Size(min= 3, message = "Name must be at least 3 characters")
    @UniqueMovieName(message = "Movie with this name already exist!")
    private String name;
    @NotNull(message = "Insert a movie length")
    @Positive(message = "Movie Length should be positive number!")
    private Integer movieLength;

    @NotNull(message = "You must select hall number!")
    private HallNumber hallNumber;
    @NotEmpty
    @Size(min = 4, max = 20, message = "Audio length must be between 4 and 10 characters")
    private String audio;
    @NotEmpty
    @Size(min = 4, max = 20, message = "Subtitles length must be between 4 and 10 characters")
    private String subtitles;
    @NotEmpty(message = "Description cannot be null ot empty!")
    @Size(min = 5, message = "Description must be at least 5 characters!")
    private String description;
    @NotEmpty
    @Size(min = 10, message = "Put correct imageUrl")
    private String imageUrl;
    @NotEmpty
    @Size(min = 10, message = "Put correct trailerUrl")
    private String trailerUrl; //TODO: trailer трябва да мачва 'https://www.youtube.com/embed/mps1HbpECIA'
    @NotNull(message = "Please select a format of projection!")
    private ProjectionFormat projectionFormat;
    @NotNull(message = "Please select a class of the movie!")
    private MovieClassEnum movieClass;
    @NotEmpty(message = "Please select min 1 category!")
    private List<Genre> genreCategories;

    public CreateMovieDto() {
        this.genreCategories = new ArrayList<>();
    }

    public String getName() {
        return name;
    }

    public CreateMovieDto setName(String name) {
        this.name = name;
        return this;
    }

    public Integer getMovieLength() {
        return movieLength;
    }

    public CreateMovieDto setMovieLength(Integer movieLength) {
        this.movieLength = movieLength;
        return this;
    }

    public HallNumber getHallNumber() {
        return hallNumber;
    }

    public CreateMovieDto setHallNumber(HallNumber hallNumber) {
        this.hallNumber = hallNumber;
        return this;
    }

    public String getAudio() {
        return audio;
    }

    public CreateMovieDto setAudio(String audio) {
        this.audio = audio;
        return this;
    }

    public String getSubtitles() {
        return subtitles;
    }

    public CreateMovieDto setSubtitles(String subtitles) {
        this.subtitles = subtitles;
        return this;
    }

    public String getDescription() {
        return description;
    }

    public CreateMovieDto setDescription(String description) {
        this.description = description;
        return this;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public CreateMovieDto setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
        return this;
    }

    public String getTrailerUrl() {
        return trailerUrl;
    }

    public CreateMovieDto setTrailerUrl(String trailerUrl) {
        this.trailerUrl = trailerUrl;
        return this;
    }

    public ProjectionFormat getProjectionFormat() {
        return projectionFormat;
    }

    public CreateMovieDto setProjectionFormat(ProjectionFormat projectionFormat) {
        this.projectionFormat = projectionFormat;
        return this;
    }

    public MovieClassEnum getMovieClass() {
        return movieClass;
    }

    public CreateMovieDto setMovieClass(MovieClassEnum movieClass) {
        this.movieClass = movieClass;
        return this;
    }

    public List<Genre> getGenreCategories() {
        return genreCategories;
    }

    public CreateMovieDto setGenreCategories(List<Genre> genreCategories) {
        this.genreCategories = genreCategories;
        return this;
    }
}
