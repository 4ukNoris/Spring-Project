package bg.softuni.mycinematicketsapp.services.impl;

import bg.softuni.mycinematicketsapp.models.dtos.MovieViewDto;
import bg.softuni.mycinematicketsapp.models.dtos.TicketViewDto;
import bg.softuni.mycinematicketsapp.models.dtos.UpdateTicketDto;
import bg.softuni.mycinematicketsapp.models.entities.Order;
import bg.softuni.mycinematicketsapp.models.entities.Ticket;
import bg.softuni.mycinematicketsapp.models.entities.UserEntity;
import bg.softuni.mycinematicketsapp.models.enums.TicketType;
import bg.softuni.mycinematicketsapp.repository.OrderRepository;
import bg.softuni.mycinematicketsapp.repository.TicketRepository;
import bg.softuni.mycinematicketsapp.repository.UserRepository;
import bg.softuni.mycinematicketsapp.services.MovieService;
import bg.softuni.mycinematicketsapp.services.OrderService;
import bg.softuni.mycinematicketsapp.services.TicketService;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class TicketServiceImpl implements TicketService {
    private final TicketRepository ticketRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final OrderService orderService;
    private final MovieService movieService;

    @Autowired
    public TicketServiceImpl(TicketRepository ticketRepository, OrderRepository orderRepository,
                             UserRepository userRepository, OrderService orderService, MovieService movieService) {
        this.ticketRepository = ticketRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.orderService = orderService;
        this.movieService = movieService;
    }

    @Override
    @Transactional
    public void createTickets(TicketViewDto createTicket, long orderId, long movieId) {
        Order order = this.orderService.getOrderById(orderId);

        MovieViewDto movieViewDto = this.movieService.getMovieViewById(movieId);
        UserEntity user = order.getUser();
        List<Ticket> unfinishedTicketsByUser = this.getNotFinishedTicketsByUser(user);

        if (!unfinishedTicketsByUser.isEmpty()) {
            order.getTickets().removeAll(unfinishedTicketsByUser);
            user.getTickets().removeAll(unfinishedTicketsByUser);

            this.orderRepository.save(order);
            this.userRepository.save(user);
            unfinishedTicketsByUser
                    .forEach(ticket -> this.ticketRepository.deleteById(ticket.getId()));
        }

        List<Ticket> ticketsToSave = getTicketList(createTicket, movieViewDto, order);
        order.setTickets(ticketsToSave);

        this.ticketRepository.saveAll(ticketsToSave);

        this.orderRepository.save(order);

        user.setTickets(ticketsToSave);
        this.userRepository.save(user);

    }

    @Override
    public List<Ticket> getTicketsByOrder(Order order) {
        return order.getTickets();
    }

    @Override
    public void updateTicketsWithSeats(UpdateTicketDto updateTicket, long orderId, long movieId) {
        Order order = this.orderService.getOrderById(orderId);
        order.getTickets().forEach(ticket -> {

            for (Map.Entry<Integer, List<Integer>> entry : updateTicket.getSeats().entrySet()) {
                boolean isSelected = false;
                for (int seat : entry.getValue()) {
                    ticket.setNumberOfRow(entry.getKey());
                    ticket.setNumberOfSeat(seat);
                    entry.getValue().remove(seat);
                    isSelected = true;
                    break;
                }
                if (isSelected) {
                    break;
                }
            }


        });
        this.orderRepository.save(order);

    }

    private List<Ticket> getTicketList(TicketViewDto createTicket, MovieViewDto movieViewDto, Order order) {
        List<Ticket> ticketsToSave = new ArrayList<>();

        for (int i = 0; i < order.getChildQuantity(); i++) {
            TicketType ticketType = TicketType.CHILDREN_UNDER_16;
            Ticket ticket = this.mapTicketToTicketViewDto(createTicket, movieViewDto, ticketType, order.getBookingTime(), order);
            ticketsToSave.add(ticket);
        }
        for (int i = 0; i < order.getRegularQuantity(); i++) {
            TicketType ticketType = TicketType.REGULAR;
            Ticket ticket = this.mapTicketToTicketViewDto(createTicket, movieViewDto, ticketType, order.getBookingTime(), order);
            ticketsToSave.add(ticket);
        }
        for (int i = 0; i < order.getStudentQuantity(); i++) {
            TicketType ticketType = TicketType.PUPILS_AND_STUDENTS;
            Ticket ticket = this.mapTicketToTicketViewDto(createTicket, movieViewDto, ticketType, order.getBookingTime(), order);
            ticketsToSave.add(ticket);
        }
        for (int i = 0; i < order.getOverSixtyQuantity(); i++) {
            TicketType ticketType = TicketType.PERSONS_OVER_60;
            Ticket ticket = this.mapTicketToTicketViewDto(createTicket, movieViewDto, ticketType, order.getBookingTime(), order);
            ticketsToSave.add(ticket);
        }
        return ticketsToSave;
    }


    private Ticket mapTicketToTicketViewDto(TicketViewDto createTicket, MovieViewDto movieViewDto,
                                            TicketType ticketType, String bookingTime, Order order) {
        return new Ticket()
                .setMovieName(movieViewDto.getName())
                .setHallNumber(movieViewDto.getHallNumber())
                .setPrice(ticketType.getPrice())
                .setProjectionDate(order.getProjectionDate())
                .setNumberOfRow(createTicket.getNumberOfRow())
                .setNumberOfSeat(createTicket.getNumberOfSeat())
                .setTicketType(ticketType)
                .setBookingTime(bookingTime)
                .setCity(order.getCity())
                .setMovieClassDescription(movieViewDto.getMovieClass().getDescription());
    }

    private List<Ticket> getNotFinishedTicketsByUser(UserEntity user) {
        return user.getTickets()
                .stream()
                .filter(ticket -> !ticket.isFinished())
                .toList();
    }
}
