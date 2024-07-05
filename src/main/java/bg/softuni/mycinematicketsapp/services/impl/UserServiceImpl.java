package bg.softuni.mycinematicketsapp.services.impl;

import bg.softuni.mycinematicketsapp.models.dtos.UserRegisterDto;
import bg.softuni.mycinematicketsapp.models.entities.UserEntity;
import bg.softuni.mycinematicketsapp.models.entities.UserRole;
import bg.softuni.mycinematicketsapp.models.enums.UserRoleEnum;
import bg.softuni.mycinematicketsapp.models.events.UserRegisteredEvent;
import bg.softuni.mycinematicketsapp.repository.UserRepository;
import bg.softuni.mycinematicketsapp.services.UserRoleService;
import bg.softuni.mycinematicketsapp.services.UserService;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserRoleService userRoleService;
    private final PasswordEncoder passwordEncoder;
    private final ModelMapper modelMapper;
    private final ApplicationEventPublisher appEventPublisher;

    @Autowired
    public UserServiceImpl(UserRepository userRepository, UserRoleService userRoleService,
                           PasswordEncoder passwordEncoder, ModelMapper modelMapper, ApplicationEventPublisher appEventPublisher) {
        this.userRepository = userRepository;
        this.userRoleService = userRoleService;
        this.passwordEncoder = passwordEncoder;
        this.modelMapper = modelMapper;
        this.appEventPublisher = appEventPublisher;
    }

    @Override
    public void registerUser(UserRegisterDto registerDto) {
        UserEntity user = this.mapUserDtoToUser(registerDto);
        this.userRepository.save(user);

        this.appEventPublisher.publishEvent(new UserRegisteredEvent(
                "UserService",
                registerDto.getEmail(),
                registerDto.getName()
        ));
    }


    private UserEntity mapUserDtoToUser(UserRegisterDto registerDto) {

        UserRole roleTypeUser = this.userRoleService.getRoleByName(UserRoleEnum.USER);
        UserEntity user = this.modelMapper
                .map(registerDto, UserEntity.class)
                .setPassword(this.passwordEncoder.encode(registerDto.getPassword()));

        List<UserRole> allRoles = this.userRoleService.getAllRoles();
        List<UserRole> rolesForUser = user.getRoles();
        rolesForUser.add(roleTypeUser);

        user.setRoles(this.userRepository.count() == 0 ? allRoles : rolesForUser);
        return user;
    }
}
